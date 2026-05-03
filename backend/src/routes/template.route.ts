import express from 'express';
import { createTemplate, getTemplateById, getTemplates } from '../controllers/template.controller.js';

export const templateRouter = express.Router();

templateRouter.post('/', createTemplate);
templateRouter.get('/', getTemplates);
templateRouter.get('/:id', getTemplateById);
