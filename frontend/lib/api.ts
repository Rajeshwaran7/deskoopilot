import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' }
});

export interface GenerateDocumentPayload {
  userId: string;
  templateId: string;
  variables: Record<string, unknown>;
}

export function getTemplates() {
  return api.get('/templates');
}

export function generateDocument(payload: GenerateDocumentPayload) {
  return api.post('/documents/generate', payload);
}

export function aiEditDocument(documentId: string, prompt: string) {
  return api.post('/documents/ai-edit', { documentId, prompt });
}

export function analyzeDocument(documentId: string) {
  return api.post('/documents/analyze', { documentId });
}
