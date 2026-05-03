import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { TemplateService } from '../services/template.service.js';

const templateService = new TemplateService();

function httpError(status: number, message: string) {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
}

export async function createTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const template = await templateService.createTemplate(req.body);
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
}

export async function getTemplates(req: Request, res: Response, next: NextFunction) {
  try {
    const templates = await templateService.getTemplates();
    res.json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
}

export async function getTemplateById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw httpError(400, 'Invalid template id');
    }
    const template = await templateService.getTemplateById(id);
    if (!template) {
      throw httpError(404, 'Template not found');
    }
    res.json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
}
