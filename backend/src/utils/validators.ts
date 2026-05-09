import { z } from 'zod';

export const createTemplateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['offer_letter', 'policy', 'contract', 'notice']),
  content: z.string().min(10),
  placeholders: z.array(z.string()).optional(),
  metadata: z.object({
    category: z.string().optional(),
    description: z.string().optional()
  }).optional(),
  ownerId: z.string().optional()
});

export const generateDocumentSchema = z.object({
  userId: z.string().min(1).optional(),
  templateId: z.string().min(1),
  variables: z.record(z.any())
});

export const generateDocumentWithRAGSchema = z.object({
  userId: z.string().min(1),
  userInput: z.string().min(10),
  documentType: z.string().min(1)
});

export const aiEditSchema = z.object({
  documentId: z.string().min(1),
  prompt: z.string().min(10)
});

export const analyzeDocumentSchema = z.object({
  documentId: z.string().min(1)
});

export const documentIdParamSchema = z.object({
  id: z.string().min(1)
});

export const workflowDocumentSchema = z.object({
  action: z.enum(['submit', 'hr_approve', 'manager_approve', 'reject']),
  note: z.string().optional(),
  actorUserId: z.string().optional()
});

export const listDocumentsQuerySchema = z.object({
  userId: z.string().optional(),
  limit: z.coerce.number().min(1).max(200).optional()
});

export const patchDocumentSchema = z.object({
  generatedContent: z.string().min(1)
});
