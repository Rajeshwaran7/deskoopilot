import OpenAI from 'openai';
import { getConfig } from '../../config/env.js';
import type { AIService, GenerateDocumentResult, EditDocumentResult, AnalyzeComplianceResult } from './AIService.js';

const SYSTEM_PROMPT = `You are an Indian HR legal expert responsible for producing compliant HR documents, including offer letters, policies, and employee contracts. Focus on India-specific labor laws, statutory requirements, and compliance risk mitigation. Output the response in strict JSON when requested, and do not include explanatory text outside the JSON structure.`;

function buildTemplatePrompt(template: string, variables: Record<string, unknown>) {
  return `Create a complete document using the provided template and variables.

Template:
${template}

Variables:
${JSON.stringify(variables, null, 2)}

Return only valid JSON with the following shape:
{
  "generatedContent": string,
  "metadata": { "engine": string }
}`;
}

function buildEditPrompt(content: string, prompt: string) {
  return `You are editing an HR compliance document.

Current document:
${content}

Instructions:
${prompt}

Return only valid JSON with the shape:
{
  "editedContent": string,
  "tokens": number
}`;
}

function buildAnalyzePrompt(content: string, variables: Record<string, unknown>) {
  return `Analyze the following Indian HR document for compliance risk.

Document:
${content}

Variables:
${JSON.stringify(variables, null, 2)}

Return only valid JSON with the shape:
{
  "riskScore": number,
  "complianceIssues": [{ "rule": string, "detail": string }],
  "suggestions": [string]
}`;
}

function parseJson<T>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    const payload = value.trim();
    const jsonMatch = payload.match(/\{[\s\S]*\}$/);
    if (!jsonMatch) {
      throw new Error('Unable to parse AI JSON response');
    }
    return JSON.parse(jsonMatch[0]) as T;
  }
}

export class OpenAIProvider implements AIService {
  private client: OpenAI;
  private model: string;
  private useMock: boolean;

  constructor() {
    const config = getConfig();
    const apiKey = config.AZURE_OPENAI_KEY ?? config.OPENAI_API_KEY;
    const baseURL = config.AZURE_OPENAI_ENDPOINT ?? config.OPENAI_API_BASE;

    this.model = config.AZURE_OPENAI_DEPLOYMENT_NAME ?? 'gpt-4o-mini';
    this.client = new OpenAI({ apiKey, baseURL });
    
    // Check if using placeholder API key
    this.useMock = apiKey === 'your-openai-key' || apiKey === 'your-azure-key';
  }

  private async createChatCompletion(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>) {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0,
      max_tokens: 1200
    });

    return response.choices?.[0]?.message?.content ?? '';
  }

  async generateDocument(template: string, variables: Record<string, unknown>): Promise<GenerateDocumentResult> {
    if (this.useMock) {
      // Return mock response for demo purposes
      const mockContent = template.replace(/\{\{(\w+)\}\}/g, (match, key) => 
        variables[key] ? String(variables[key]) : match
      );
      return {
        generatedContent: mockContent,
        metadata: { engine: 'mock-ai' }
      };
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildTemplatePrompt(template, variables) }
    ];

    const text = await this.createChatCompletion(messages);
    const result = parseJson<GenerateDocumentResult>(text);

    return { generatedContent: result.generatedContent, metadata: { engine: this.model } };
  }

  async editDocumentWithPrompt(content: string, prompt: string): Promise<EditDocumentResult> {
    if (this.useMock) {
      // Return mock response for demo purposes
      return {
        editedContent: content + '\n\n[AI Edit Applied: ' + prompt + ']',
        tokens: 150
      };
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildEditPrompt(content, prompt) }
    ];

    const text = await this.createChatCompletion(messages);
    return parseJson<EditDocumentResult>(text);
  }

  async analyzeCompliance(content: string, variables: Record<string, unknown>): Promise<AnalyzeComplianceResult> {
    if (this.useMock) {
      // Return mock response for demo purposes
      return {
        riskScore: Math.floor(Math.random() * 30), // Random low risk score
        complianceIssues: [],
        suggestions: ['Document appears compliant with basic Indian labor laws.', 'Consider adding specific state-level compliance clauses.']
      };
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildAnalyzePrompt(content, variables) }
    ];

    const text = await this.createChatCompletion(messages);
    return parseJson<AnalyzeComplianceResult>(text);
  }
}
