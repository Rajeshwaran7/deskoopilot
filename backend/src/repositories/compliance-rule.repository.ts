import { ComplianceRuleModel, IComplianceRule } from '../models/ComplianceRule.model.js';

export class ComplianceRuleRepository {
  async findActiveRules() {
    return ComplianceRuleModel.find({ enabled: true }).sort({ severity: -1, createdAt: -1 }).lean();
  }

  async create(data: Partial<IComplianceRule>) {
    return ComplianceRuleModel.create(data);
  }
}
