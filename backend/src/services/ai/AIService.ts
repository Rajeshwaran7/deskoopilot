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

export interface ExplainRiskResult {
  explanation: string;
}

export interface AutoFixResult {
  editedContent: string;
  tokens: number;
}

export interface SuggestCompliantResult {
  generatedContent: string;
}

export interface AIService {
  generateDocument(template: string, variables: Record<string, unknown>): Promise<GenerateDocumentResult>;
  editDocumentWithPrompt(content: string, prompt: string): Promise<EditDocumentResult>;
  analyzeCompliance(content: string, variables: Record<string, unknown>): Promise<AnalyzeComplianceResult>;
  explainRisk(
    content: string,
    variables: Record<string, unknown>,
    complianceIssues: Array<{ rule: string; detail: string }>,
    suggestions: string[]
  ): Promise<ExplainRiskResult>;
  autoFixCompliance(
    content: string,
    variables: Record<string, unknown>,
    complianceIssues: Array<{ rule: string; detail: string }>
  ): Promise<AutoFixResult>;
  suggestCompliantVersion(content: string, variables: Record<string, unknown>): Promise<SuggestCompliantResult>;
}

const provider = new OpenAIProvider();

export const aiService: AIService = {
  generateDocument: (template, variables) => provider.generateDocument(template, variables),
  editDocumentWithPrompt: (content, prompt) => provider.editDocumentWithPrompt(content, prompt),
  analyzeCompliance: (content, variables) => provider.analyzeCompliance(content, variables),
  explainRisk: (content, variables, issues, suggestions) =>
    provider.explainRisk(content, variables, issues, suggestions),
  autoFixCompliance: (content, variables, issues) => provider.autoFixCompliance(content, variables, issues),
  suggestCompliantVersion: (content, variables) => provider.suggestCompliantVersion(content, variables)
};
