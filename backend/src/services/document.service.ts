import mongoose from 'mongoose';
import { DocumentRepository } from '../repositories/document.repository.js';
import { TemplateRepository } from '../repositories/template.repository.js';
import { RuleEngine } from './rule-engine.service.js';
import { aiService } from './ai/AIService.js';

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class DocumentService {
  private documentRepository = new DocumentRepository();
  private templateRepository = new TemplateRepository();
  private ruleEngine = new RuleEngine();

  async generateDocument(userId: string, templateId: string, variables: Record<string, unknown>) {
    if (!isValidObjectId(userId)) {
      throw new Error('Invalid userId format');
    }
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

    return this.documentRepository.create({
      userId: new mongoose.Types.ObjectId(userId),
      templateId: new mongoose.Types.ObjectId(templateId),
      generatedContent: generated.generatedContent,
      variables,
      riskScore: ruleResult.riskScore,
      suggestions: ruleResult.suggestions,
      complianceIssues: ruleResult.complianceIssues,
      status: 'review'
    });
  }

  async editDocumentWithPrompt(documentId: string, prompt: string) {
    if (!isValidObjectId(documentId)) {
      throw new Error('Invalid documentId format');
    }
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const editResult = await aiService.editDocumentWithPrompt(document.generatedContent, prompt);
    const ruleResult = await this.ruleEngine.evaluate({
      content: editResult.editedContent,
      variables: document.variables
    });

    return this.documentRepository.update(documentId, {
      generatedContent: editResult.editedContent,
      riskScore: ruleResult.riskScore,
      suggestions: ruleResult.suggestions,
      complianceIssues: ruleResult.complianceIssues,
      status: 'review'
    });
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
      variables: document.variables
    });

    return {
      riskScore: Math.max(analysis.riskScore, ruleResult.riskScore),
      complianceIssues: [...analysis.complianceIssues, ...ruleResult.complianceIssues],
      suggestions: Array.from(new Set([...analysis.suggestions, ...ruleResult.suggestions]))
    };
  }
}
