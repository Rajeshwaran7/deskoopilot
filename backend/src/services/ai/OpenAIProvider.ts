import OpenAI from 'openai';
import { getConfig } from '../../config/env.js';
import type {
  AIService,
  GenerateDocumentResult,
  EditDocumentResult,
  AnalyzeComplianceResult,
  ExplainRiskResult,
  AutoFixResult,
  SuggestCompliantResult
} from './AIService.js';

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

function buildExplainRiskPrompt(
  content: string,
  variables: Record<string, unknown>,
  issues: Array<{ rule: string; detail: string }>,
  suggestions: string[]
) {
  return `Explain compliance risk for this Indian HR document in plain language for an HR manager.

Document:
${content}

Variables:
${JSON.stringify(variables, null, 2)}

Flagged issues:
${JSON.stringify(issues, null, 2)}

Suggestions:
${JSON.stringify(suggestions, null, 2)}

Return only valid JSON: { "explanation": string }`;
}

function buildAutoFixPrompt(
  content: string,
  variables: Record<string, unknown>,
  issues: Array<{ rule: string; detail: string }>
) {
  return `Revise the HR document to address the listed compliance issues. Keep India-specific statutory context. Preserve structure where possible; add missing clauses verbatim where appropriate.

Document HTML/text:
${content}

Variables:
${JSON.stringify(variables, null, 2)}

Issues to fix:
${JSON.stringify(issues, null, 2)}

Return only valid JSON: { "editedContent": string, "tokens": number }`;
}

function buildSuggestCompliantPrompt(content: string, variables: Record<string, unknown>) {
  return `Produce a conservative, compliance-oriented rewrite of this Indian HR document. Include PF/ESI applicability where variables suggest coverage, and state Shops & Establishments references when variables.state is present.

Current document:
${content}

Variables:
${JSON.stringify(variables, null, 2)}

Return only valid JSON: { "generatedContent": string }`;
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
    this.client = new OpenAI({ apiKey: apiKey ?? 'missing', baseURL });

    this.useMock =
      !apiKey || apiKey === 'your-openai-key' || apiKey === 'your-azure-key';
  }

  private async createChatCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    maxTokens = 1200
  ) {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0,
      max_tokens: maxTokens
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

  async explainRisk(
    content: string,
    variables: Record<string, unknown>,
    issues: Array<{ rule: string; detail: string }>,
    suggestions: string[]
  ): Promise<ExplainRiskResult> {
    if (this.useMock) {
      const issueSummary =
        issues.length > 0
          ? issues.map((i) => `${i.rule}: ${i.detail}`).join('; ')
          : 'No automated flags.';
      return {
        explanation: `Mock summary. ${issueSummary} Review PF, ESI, and state Shops & Establishments obligations for the employee's state and wage thresholds.`
      };
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildExplainRiskPrompt(content, variables, issues, suggestions) }
    ];

    const text = await this.createChatCompletion(messages, 2000);
    return parseJson<ExplainRiskResult>(text);
  }

  async autoFixCompliance(
    content: string,
    variables: Record<string, unknown>,
    issues: Array<{ rule: string; detail: string }>
  ): Promise<AutoFixResult> {
    if (this.useMock) {
      const block =
        issues.length > 0
          ? `\n\n[Auto-fix: addressed ${issues.length} flagged item(s) per statutory placeholders.]`
          : '\n\n[Auto-fix: no issues to apply.]';
      return {
        editedContent: content + block,
        tokens: 200
      };
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildAutoFixPrompt(content, variables, issues) }
    ];

    const text = await this.createChatCompletion(messages, 4096);
    return parseJson<AutoFixResult>(text);
  }

  async suggestCompliantVersion(content: string, variables: Record<string, unknown>): Promise<SuggestCompliantResult> {
    if (this.useMock) {
      return {
        generatedContent: `<p><strong>Compliant draft (mock)</strong></p>${content}`
      };
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildSuggestCompliantPrompt(content, variables) }
    ];

    const text = await this.createChatCompletion(messages, 4096);
    return parseJson<SuggestCompliantResult>(text);
  }
}
