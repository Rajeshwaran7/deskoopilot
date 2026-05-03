import mongoose from 'mongoose';
import { getConfig } from '../config/env.js';
import { DocumentRepository } from '../repositories/document.repository.js';
import { TemplateRepository } from '../repositories/template.repository.js';
import { RuleEngine } from './rule-engine.service.js';
import { aiService } from './ai/AIService.js';
import { recordAudit, getAuditTrail } from './audit.service.js';
import type { IApprovalEvent, IVersionSnapshot, IDocument, ApprovalStage } from '../models/Document.model.js';
import { httpError } from '../utils/http-error.js';

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

function resolveUserId(explicit?: string): string {
  const fallback = getConfig().DEFAULT_USER_ID;
  const id = explicit?.trim() ? explicit : fallback;
  if (!isValidObjectId(id)) {
    throw httpError(400, 'Invalid userId format');
  }
  return id;
}

function toSnapshot(doc: IDocument & { _id?: mongoose.Types.ObjectId }, source: IVersionSnapshot['source']): IVersionSnapshot {
  return {
    version: doc.version ?? 1,
    generatedContent: doc.generatedContent,
    variables: { ...(doc.variables as Record<string, unknown>) },
    riskScore: doc.riskScore,
    suggestions: [...doc.suggestions],
    complianceIssues: doc.complianceIssues.map((i) => ({ ...i })),
    savedAt: new Date(),
    source
  };
}

export class DocumentService {
  private documentRepository = new DocumentRepository();
  private templateRepository = new TemplateRepository();
  private ruleEngine = new RuleEngine();

  async listDocuments(userId?: string, limit = 50) {
    const uid = userId?.trim() ? userId : getConfig().DEFAULT_USER_ID;
    return this.documentRepository.findAll({ userId: uid }, limit);
  }

  async getDocumentById(documentId: string) {
    if (!isValidObjectId(documentId)) {
      throw httpError(400, 'Invalid documentId format');
    }
    const doc = await this.documentRepository.findByIdWithTemplate(documentId);
    if (!doc) {
      throw httpError(404, 'Document not found');
    }
    return doc;
  }

  async deleteDocument(documentId: string, actorUserId?: string) {
    if (!isValidObjectId(documentId)) {
      throw httpError(400, 'Invalid documentId format');
    }
    const deleted = await this.documentRepository.deleteById(documentId);
    if (!deleted) {
      throw httpError(404, 'Document not found');
    }
    await recordAudit({
      entityType: 'Document',
      entityId: documentId,
      action: 'document.deleted',
      userId: actorUserId && isValidObjectId(actorUserId) ? actorUserId : undefined,
      details: { templateId: String(deleted.templateId) }
    });
    return { success: true };
  }

  async getDocumentAudit(documentId: string) {
    if (!isValidObjectId(documentId)) {
      throw httpError(400, 'Invalid documentId format');
    }
    const doc = await this.documentRepository.findById(documentId);
    if (!doc) {
      throw httpError(404, 'Document not found');
    }
    return getAuditTrail('Document', documentId, 200);
  }

  async generateDocument(userIdInput: string | undefined, templateId: string, variables: Record<string, unknown>) {
    const userId = resolveUserId(userIdInput);
    if (!isValidObjectId(templateId)) {
      throw new Error('Invalid templateId format');
    }

    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const generated = await aiService.generateDocument(template.content, variables);
    const ruleResult = await this.ruleEngine.evaluate({
      content: generated.generatedContent,
      variables
    });

    const created = await this.documentRepository.create({
      userId: new mongoose.Types.ObjectId(userId),
      templateId: new mongoose.Types.ObjectId(templateId),
      generatedContent: generated.generatedContent,
      variables,
      riskScore: ruleResult.riskScore,
      suggestions: ruleResult.suggestions,
      complianceIssues: ruleResult.complianceIssues,
      status: 'review',
      version: 1,
      versionHistory: [],
      approvalStage: 'none',
      approvalEvents: []
    });

    const doc = created.toObject();
    await recordAudit({
      entityType: 'Document',
      entityId: String(doc._id),
      action: 'document.created',
      userId,
      details: { templateId, version: 1 }
    });

    return doc;
  }

  async editDocumentWithPrompt(documentId: string, prompt: string) {
    if (!isValidObjectId(documentId)) {
      throw new Error('Invalid documentId format');
    }
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const currentVersion = document.version ?? 1;
    const snapshot = toSnapshot({ ...(document as IDocument), version: currentVersion }, 'ai_edit');
    const editResult = await aiService.editDocumentWithPrompt(document.generatedContent, prompt);
    const ruleResult = await this.ruleEngine.evaluate({
      content: editResult.editedContent,
      variables: document.variables as Record<string, unknown>
    });

    const updated = await this.documentRepository.rawUpdate(documentId, {
      $push: { versionHistory: snapshot },
      $set: {
        version: currentVersion + 1,
        generatedContent: editResult.editedContent,
        riskScore: ruleResult.riskScore,
        suggestions: ruleResult.suggestions,
        complianceIssues: ruleResult.complianceIssues,
        status: 'review'
      }
    });

    await recordAudit({
      entityType: 'Document',
      entityId: documentId,
      action: 'document.ai_edit',
      details: { version: updated.version, promptPreview: prompt.slice(0, 200) }
    });

    return updated;
  }

  async analyzeDocument(documentId: string) {
    if (!isValidObjectId(documentId)) {
      throw new Error('Invalid documentId format');
    }
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const analysis = await aiService.analyzeCompliance(document.generatedContent, document.variables);
    const ruleResult = await this.ruleEngine.evaluate({
      content: document.generatedContent,
      variables: document.variables as Record<string, unknown>
    });

    return {
      riskScore: Math.max(analysis.riskScore, ruleResult.riskScore),
      complianceIssues: [...analysis.complianceIssues, ...ruleResult.complianceIssues],
      suggestions: Array.from(new Set([...analysis.suggestions, ...ruleResult.suggestions]))
    };
  }

  async workflowTransition(
    documentId: string,
    action: IApprovalEvent['action'],
    note?: string,
    actorUserId?: string
  ) {
    if (!isValidObjectId(documentId)) {
      throw httpError(400, 'Invalid documentId format');
    }
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw httpError(404, 'Document not found');
    }

    const stage = (document.approvalStage ?? 'none') as ApprovalStage;
    const event: IApprovalEvent = {
      at: new Date(),
      role:
        action === 'submit'
          ? 'system'
          : action === 'hr_approve'
            ? 'hr'
            : action === 'manager_approve'
              ? 'manager'
              : 'hr',
      action,
      note,
      actorUserId
    };

    let nextStage: ApprovalStage = stage;
    let nextStatus: IDocument['status'] = document.status;

    if (action === 'submit') {
      if (stage !== 'none' && stage !== 'rejected') {
        throw httpError(400, 'Document already in approval workflow');
      }
      nextStage = 'pending_hr';
      event.role = 'system';
    } else if (action === 'hr_approve') {
      if (stage !== 'pending_hr') {
        throw httpError(400, 'HR approval is not pending');
      }
      nextStage = 'pending_manager';
    } else if (action === 'manager_approve') {
      if (stage !== 'pending_manager') {
        throw httpError(400, 'Manager approval is not pending');
      }
      nextStage = 'approved';
      nextStatus = 'final';
    } else if (action === 'reject') {
      nextStage = 'rejected';
      nextStatus = 'draft';
    }

    const updated = await this.documentRepository.rawUpdate(documentId, {
      $set: { approvalStage: nextStage, status: nextStatus },
      $push: { approvalEvents: event }
    });

    await recordAudit({
      entityType: 'Document',
      entityId: documentId,
      action: `workflow.${action}`,
      userId: actorUserId && isValidObjectId(actorUserId) ? actorUserId : undefined,
      details: { approvalStage: nextStage, note }
    });

    return updated;
  }

  async explainRisk(documentId: string) {
    if (!isValidObjectId(documentId)) {
      throw httpError(400, 'Invalid documentId format');
    }
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw httpError(404, 'Document not found');
    }
    const result = await aiService.explainRisk(
      document.generatedContent,
      document.variables as Record<string, unknown>,
      document.complianceIssues,
      document.suggestions
    );
    await recordAudit({
      entityType: 'Document',
      entityId: documentId,
      action: 'document.explain_risk',
      details: {}
    });
    return result;
  }

  async autoFixDocument(documentId: string) {
    if (!isValidObjectId(documentId)) {
      throw httpError(400, 'Invalid documentId format');
    }
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw httpError(404, 'Document not found');
    }

    const currentVersion = document.version ?? 1;
    const snapshot = toSnapshot({ ...(document as IDocument), version: currentVersion }, 'auto_fix');
    const fix = await aiService.autoFixCompliance(
      document.generatedContent,
      document.variables as Record<string, unknown>,
      document.complianceIssues
    );
    const ruleResult = await this.ruleEngine.evaluate({
      content: fix.editedContent,
      variables: document.variables as Record<string, unknown>
    });

    const updated = await this.documentRepository.rawUpdate(documentId, {
      $push: { versionHistory: snapshot },
      $set: {
        version: currentVersion + 1,
        generatedContent: fix.editedContent,
        riskScore: ruleResult.riskScore,
        suggestions: ruleResult.suggestions,
        complianceIssues: ruleResult.complianceIssues,
        status: 'review',
        approvalStage: 'none'
      }
    });

    await recordAudit({
      entityType: 'Document',
      entityId: documentId,
      action: 'document.auto_fix',
      details: { version: updated.version }
    });

    return updated;
  }

  async saveManualDraft(documentId: string, generatedContent: string) {
    if (!isValidObjectId(documentId)) {
      throw httpError(400, 'Invalid documentId format');
    }
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw httpError(404, 'Document not found');
    }

    if (document.generatedContent === generatedContent) {
      return document;
    }

    const currentVersion = document.version ?? 1;
    const snapshot = toSnapshot({ ...(document as IDocument), version: currentVersion }, 'manual');
    const ruleResult = await this.ruleEngine.evaluate({
      content: generatedContent,
      variables: document.variables as Record<string, unknown>
    });

    const updated = await this.documentRepository.rawUpdate(documentId, {
      $push: { versionHistory: snapshot },
      $set: {
        version: currentVersion + 1,
        generatedContent,
        riskScore: ruleResult.riskScore,
        suggestions: ruleResult.suggestions,
        complianceIssues: ruleResult.complianceIssues,
        status: 'review',
        approvalStage: 'none'
      }
    });

    await recordAudit({
      entityType: 'Document',
      entityId: documentId,
      action: 'document.manual_save',
      details: { version: updated.version }
    });

    return updated;
  }

  async suggestCompliantDocument(documentId: string) {
    if (!isValidObjectId(documentId)) {
      throw httpError(400, 'Invalid documentId format');
    }
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw httpError(404, 'Document not found');
    }

    const currentVersion = document.version ?? 1;
    const snapshot = toSnapshot({ ...(document as IDocument), version: currentVersion }, 'suggest_compliant');
    const suggestion = await aiService.suggestCompliantVersion(
      document.generatedContent,
      document.variables as Record<string, unknown>
    );
    const ruleResult = await this.ruleEngine.evaluate({
      content: suggestion.generatedContent,
      variables: document.variables as Record<string, unknown>
    });

    const updated = await this.documentRepository.rawUpdate(documentId, {
      $push: { versionHistory: snapshot },
      $set: {
        version: currentVersion + 1,
        generatedContent: suggestion.generatedContent,
        riskScore: ruleResult.riskScore,
        suggestions: ruleResult.suggestions,
        complianceIssues: ruleResult.complianceIssues,
        status: 'review',
        approvalStage: 'none'
      }
    });

    await recordAudit({
      entityType: 'Document',
      entityId: documentId,
      action: 'document.suggest_compliant',
      details: { version: updated.version }
    });

    return updated;
  }
}
