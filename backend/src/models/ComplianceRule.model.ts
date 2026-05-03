import mongoose from 'mongoose';

export interface IComplianceRuleAction {
  type: 'suggestion' | 'inject_clause' | 'flag';
  payload: string;
  /** When set with inject_clause, body is loaded from Clause library by slug. */
  clauseSlug?: string;
}

export type RuleCategory = 'pf' | 'esi' | 'shops_act' | 'general';

export interface IComplianceRule {
  name: string;
  description: string;
  condition: Record<string, unknown>;
  action: IComplianceRuleAction;
  region: string;
  /** PF / ESI / Shops Act / general — for filtering and dashboards. */
  category: RuleCategory;
  severity: 'low' | 'medium' | 'high';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ComplianceRuleSchema = new mongoose.Schema<IComplianceRule>(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    condition: { type: Object, required: true },
    action: { type: Object, required: true },
    region: { type: String, default: 'India' },
    category: {
      type: String,
      enum: ['pf', 'esi', 'shops_act', 'general'],
      default: 'general'
    },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    enabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const ComplianceRuleModel = mongoose.model<IComplianceRule>('ComplianceRule', ComplianceRuleSchema);
