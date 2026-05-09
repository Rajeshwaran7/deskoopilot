import express from 'express';
import {
  listDocuments,
  getDocumentById,
  getDocumentAudit,
  deleteDocument,
  generateDocument,
  generateDocumentWithRAG,
  aiEditDocument,
  analyzeDocument,
  workflowDocument,
  explainRisk,
  autoFixDocument,
  suggestCompliantDocument,
  patchDocument
} from '../controllers/document.controller.js';

export const documentRouter = express.Router();

documentRouter.get('/', listDocuments);
documentRouter.post('/generate', generateDocument);
documentRouter.post('/generate-rag', generateDocumentWithRAG);
documentRouter.post('/ai-edit', aiEditDocument);
documentRouter.post('/analyze', analyzeDocument);

documentRouter.get('/:id/audit', getDocumentAudit);
documentRouter.patch('/:id', patchDocument);
documentRouter.post('/:id/workflow', workflowDocument);
documentRouter.post('/:id/explain-risk', explainRisk);
documentRouter.post('/:id/auto-fix', autoFixDocument);
documentRouter.post('/:id/suggest-compliant', suggestCompliantDocument);
documentRouter.get('/:id', getDocumentById);
documentRouter.delete('/:id', deleteDocument);
