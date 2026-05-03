import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service.js';
import {
  generateDocumentSchema,
  aiEditSchema,
  analyzeDocumentSchema,
  workflowDocumentSchema,
  listDocumentsQuerySchema,
  patchDocumentSchema
} from '../utils/validators.js';
import { httpError } from '../utils/http-error.js';

const documentService = new DocumentService();

function validationError(message: string) {
  const e = httpError(400, message);
  return e;
}

export async function listDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = listDocumentsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return next(validationError(parsed.error.errors.map((e) => e.message).join('; ')));
    }
    const { userId, limit } = parsed.data;
    const data = await documentService.listDocuments(userId, limit ?? 50);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getDocumentById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await documentService.getDocumentById(id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getDocumentAudit(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await documentService.getDocumentAudit(id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function patchDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = patchDocumentSchema.safeParse(req.body);
    if (!validation.success) {
      const error = validationError(validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '));
      return next(error);
    }
    const { id } = req.params;
    const updated = await documentService.saveManualDraft(id, validation.data.generatedContent);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const actorUserId = typeof req.query.actorUserId === 'string' ? req.query.actorUserId : undefined;
    const data = await documentService.deleteDocument(id, actorUserId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function generateDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = generateDocumentSchema.safeParse(req.body);
    if (!validation.success) {
      const error = validationError(validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '));
      return next(error);
    }
    const { templateId, variables, userId } = validation.data;
    const document = await documentService.generateDocument(userId, templateId, variables);
    res.status(201).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
}

export async function aiEditDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = aiEditSchema.safeParse(req.body);
    if (!validation.success) {
      const error = validationError(validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '));
      return next(error);
    }
    const { documentId, prompt } = validation.data;
    const updated = await documentService.editDocumentWithPrompt(documentId, prompt);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function analyzeDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = analyzeDocumentSchema.safeParse(req.body);
    if (!validation.success) {
      const error = validationError(validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '));
      return next(error);
    }
    const { documentId } = validation.data;
    const analysis = await documentService.analyzeDocument(documentId);
    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
}

export async function workflowDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = workflowDocumentSchema.safeParse(req.body);
    if (!validation.success) {
      const error = validationError(validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '));
      return next(error);
    }
    const { id } = req.params;
    const { action, note, actorUserId } = validation.data;
    const updated = await documentService.workflowTransition(id, action, note, actorUserId);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function explainRisk(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await documentService.explainRisk(id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function autoFixDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await documentService.autoFixDocument(id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function suggestCompliantDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await documentService.suggestCompliantDocument(id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
