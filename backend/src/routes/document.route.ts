import express from 'express';
import { generateDocument, aiEditDocument, analyzeDocument } from '../controllers/document.controller.js';

export const documentRouter = express.Router();

documentRouter.post('/generate', generateDocument);
documentRouter.post('/ai-edit', aiEditDocument);
documentRouter.post('/analyze', analyzeDocument);
