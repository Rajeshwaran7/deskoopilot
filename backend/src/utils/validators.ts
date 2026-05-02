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
  userId: z.string().min(1),
  templateId: z.string().min(1),
  variables: z.record(z.any())
});

export const aiEditSchema = z.object({
  documentId: z.string().min(1),
  prompt: z.string().min(10)
});

export const analyzeDocumentSchema = z.object({
  documentId: z.string().min(1)
});
