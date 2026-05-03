import jsonLogic from 'json-logic-js';
import { ComplianceRuleRepository } from '../repositories/compliance-rule.repository.js';
import { ClauseRepository } from '../repositories/clause.repository.js';
import type { IComplianceRuleAction } from '../models/ComplianceRule.model.js';

export interface RuleEngineResult {
  riskScore: number;
  suggestions: string[];
  complianceIssues: Array<{ rule: string; detail: string }>;
}

function normalizeVariables(variables: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = { ...variables };
  for (const key of ['salary', 'grossSalary', 'monthlyGross', 'employeeCount', 'employeeStrength']) {
    const v = normalized[key];
    if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) {
      normalized[key] = Number(v);
    }
  }
  return normalized;
}

export class RuleEngine {
  private repository = new ComplianceRuleRepository();
  private clauses = new ClauseRepository();

  private async resolveInjectText(action: IComplianceRuleAction): Promise<string> {
    if (action.clauseSlug) {
      const clause = await this.clauses.findBySlug(action.clauseSlug);
      if (clause?.body) {
        return `${clause.title}: ${clause.body}`;
      }
    }
    return action.payload;
  }

  async evaluate(payload: { content: string; variables: Record<string, unknown> }): Promise<RuleEngineResult> {
    const rules = await this.repository.findActiveRules();
    const suggestions: string[] = [];
    const complianceIssues: Array<{ rule: string; detail: string }> = [];
    let riskScore = 0;

    const variables = normalizeVariables(payload.variables ?? {});
    const data = {
      content: payload.content,
      variables
    };

    for (const rule of rules) {
      const matches = jsonLogic.apply(rule.condition, data);
      if (!matches) continue;

      const action = rule.action;
      if (action?.type === 'suggestion') {
        suggestions.push(action.payload);
      } else if (action?.type === 'inject_clause') {
        const text = await this.resolveInjectText(action);
        suggestions.push(`Inject clause: ${text}`);
      } else if (action?.type === 'flag') {
        const detail = action.clauseSlug
          ? (await this.resolveInjectText(action)) || action.payload
          : action.payload;
        complianceIssues.push({ rule: rule.name, detail });
      }

      if (rule.severity === 'high') {
        riskScore += 30;
      } else if (rule.severity === 'medium') {
        riskScore += 15;
      } else if (rule.severity === 'low') {
        riskScore += 8;
      }
    }

    return {
      riskScore: Math.min(riskScore, 100),
      suggestions,
      complianceIssues
    };
  }
}
