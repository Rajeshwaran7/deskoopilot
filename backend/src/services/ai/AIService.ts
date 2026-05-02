import { OpenAIProvider } from './OpenAIProvider.js';

export interface GenerateDocumentResult {
  generatedContent: string;
  metadata: { engine: string };
}

export interface EditDocumentResult {
  editedContent: string;
  tokens: number;
}

export interface AnalyzeComplianceResult {
  riskScore: number;
  complianceIssues: Array<{ rule: string; detail: string }>;
  suggestions: string[];
}

export interface AIService {
  generateDocument(template: string, variables: Record<string, unknown>): Promise<GenerateDocumentResult>;
  editDocumentWithPrompt(content: string, prompt: string): Promise<EditDocumentResult>;
  analyzeCompliance(content: string, variables: Record<string, unknown>): Promise<AnalyzeComplianceResult>;
}

const provider = new OpenAIProvider();

export const aiService: AIService = {
  generateDocument: (template, variables) => provider.generateDocument(template, variables),
  editDocumentWithPrompt: (content, prompt) => provider.editDocumentWithPrompt(content, prompt),
  analyzeCompliance: (content, variables) => provider.analyzeCompliance(content, variables)
};
