import jsonLogic from 'json-logic-js';
import { ComplianceRuleRepository } from '../repositories/compliance-rule.repository.js';

export interface RuleEngineResult {
  riskScore: number;
  suggestions: string[];
  complianceIssues: Array<{ rule: string; detail: string }>;
}

export class RuleEngine {
  private repository = new ComplianceRuleRepository();

  async evaluate(payload: { content: string; variables: Record<string, unknown> }): Promise<RuleEngineResult> {
    const rules = await this.repository.findActiveRules();
    const suggestions: string[] = [];
    const complianceIssues: Array<{ rule: string; detail: string }> = [];
    let riskScore = 0;

    rules.forEach((rule) => {
      const data = {
        content: payload.content,
        variables: payload.variables
      };

      const matches = jsonLogic.apply(rule.condition, data);
      if (matches) {
        if (rule.action && rule.action.type === 'suggestion') {
          suggestions.push(rule.action.payload);
        } else if (rule.action && rule.action.type === 'inject_clause') {
          suggestions.push(`Inject clause: ${rule.action.payload}`);
        } else if (rule.action && rule.action.type === 'flag') {
          complianceIssues.push({ rule: rule.name, detail: rule.action.payload });
        }

        if (rule.severity === 'high') {
          riskScore += 30;
        } else if (rule.severity === 'medium') {
          riskScore += 15;
        } else if (rule.severity === 'low') {
          riskScore += 8;
        }
      }
    });

    return {
      riskScore: Math.min(riskScore, 100),
      suggestions,
      complianceIssues
    };
  }
}
