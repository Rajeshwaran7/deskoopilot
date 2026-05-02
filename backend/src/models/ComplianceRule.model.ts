import mongoose from 'mongoose';

export interface IComplianceRuleAction {
  type: 'suggestion' | 'inject_clause' | 'flag';
  payload: string;
}

export interface IComplianceRule {
  name: string;
  description: string;
  condition: Record<string, unknown>;
  action: IComplianceRuleAction;
  region: string;
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
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    enabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const ComplianceRuleModel = mongoose.model<IComplianceRule>('ComplianceRule', ComplianceRuleSchema);
