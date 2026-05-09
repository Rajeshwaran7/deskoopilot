import axios from 'axios';

const baseURL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) ||
  'http://localhost:4000/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

export interface GenerateDocumentPayload {
  userId?: string;
  templateId: string;
  variables: Record<string, unknown>;
}

export function getTemplates() {
  return api.get('/templates');
}

export function getTemplateById(templateId: string) {
  return api.get(`/templates/${templateId}`);
}

export function listDocuments(params?: { userId?: string; limit?: number }) {
  return api.get('/documents', { params });
}

export function getDocumentById(id: string) {
  return api.get(`/documents/${id}`);
}

export function patchDocument(id: string, generatedContent: string) {
  return api.patch(`/documents/${id}`, { generatedContent });
}

export function getDocumentAudit(id: string) {
  return api.get(`/documents/${id}/audit`);
}

export function deleteDocument(id: string, actorUserId?: string) {
  return api.delete(`/documents/${id}`, { params: actorUserId ? { actorUserId } : undefined });
}

export interface GenerateDocumentWithRAGPayload {
  userId: string;
  userInput: string;
  documentType: string;
}

export function generateDocument(payload: GenerateDocumentPayload) {
  return api.post('/documents/generate', payload);
}

export function generateDocumentWithRAG(payload: GenerateDocumentWithRAGPayload) {
  return api.post('/documents/generate-rag', payload);
}

export function aiEditDocument(documentId: string, prompt: string) {
  return api.post('/documents/ai-edit', { documentId, prompt });
}

export function analyzeDocument(documentId: string) {
  return api.post('/documents/analyze', { documentId });
}

export function workflowDocument(
  id: string,
  body: { action: 'submit' | 'hr_approve' | 'manager_approve' | 'reject'; note?: string; actorUserId?: string }
) {
  return api.post(`/documents/${id}/workflow`, body);
}

export function explainRisk(documentId: string) {
  return api.post(`/documents/${documentId}/explain-risk`, {});
}

export function autoFixDocument(documentId: string) {
  return api.post(`/documents/${documentId}/auto-fix`, {});
}

export function suggestCompliantDocument(documentId: string) {
  return api.post(`/documents/${documentId}/suggest-compliant`, {});
}

export function listClauses(params?: { state?: string; category?: string }) {
  return api.get('/clauses', { params });
}
