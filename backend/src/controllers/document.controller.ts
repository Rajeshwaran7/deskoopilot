import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service.js';
import { generateDocumentSchema, aiEditSchema, analyzeDocumentSchema } from '../utils/validators.js';

const documentService = new DocumentService();

export async function generateDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = generateDocumentSchema.safeParse(req.body);
    if (!validation.success) {
      const error = new Error(validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; '));
      (error as any).status = 400;
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
      const error = new Error(validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; '));
      (error as any).status = 400;
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
      const error = new Error(validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; '));
      (error as any).status = 400;
      return next(error);
    }
    const { documentId } = validation.data;
    const analysis = await documentService.analyzeDocument(documentId);
    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
}
