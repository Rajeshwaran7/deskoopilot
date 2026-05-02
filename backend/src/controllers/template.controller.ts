import { Request, Response, NextFunction } from 'express';
import { TemplateService } from '../services/template.service.js';

const templateService = new TemplateService();

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
