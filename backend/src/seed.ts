import mongoose from 'mongoose';
import { TemplateModel } from './models/Template.model.js';
import { ComplianceRuleModel } from './models/ComplianceRule.model.js';
import { UserModel } from './models/User.model.js';
import { connectDatabase } from './config/database.js';
import { loadEnvironment } from './config/env.js';
import { DEMO_USER_OBJECT_ID } from './config/constants.js';
import { ClauseRepository } from './repositories/clause.repository.js';
import { SEED_CLAUSES, SEED_RULES } from './seed/compliance-seed.js';

loadEnvironment();

async function seedData() {
  await connectDatabase();

  const demoUserId = new mongoose.Types.ObjectId(DEMO_USER_OBJECT_ID);
  await UserModel.findByIdAndUpdate(
    demoUserId,
    {
      email: 'demo@deskoopilot.local',
      password: 'not-used-change-with-auth',
      plan: 'pro',
      role: 'admin'
    },
    { upsert: true }
  );

  const clauseRepo = new ClauseRepository();
  await clauseRepo.upsertMany(SEED_CLAUSES);

  const templates = [
    {
      name: 'Offer Letter - Entry Level',
      type: 'offer_letter' as const,
      content:
        'Dear {{candidateName}},\n\nWe are pleased to offer you the position of {{position}}. Your monthly gross compensation will be ₹{{salary}}.\n\nWork state: {{state}}. (For compliance checks, also provide establishment employeeCount={{employeeCount}} and monthly gross for ESI={{grossSalary}}.)\n\nBest regards,\nHR Team',
      placeholders: ['candidateName', 'position', 'salary', 'state', 'employeeCount', 'grossSalary'],
      ownerId: demoUserId
    },
    {
      name: 'Leave Policy',
      type: 'policy' as const,
      content: 'This leave policy outlines the entitlements for employees. Annual leave is {{annualLeaveDays}} days.',
      placeholders: ['annualLeaveDays'],
      ownerId: demoUserId
    }
  ];

  for (const template of templates) {
    await TemplateModel.findOneAndUpdate({ name: template.name }, template, { upsert: true });
  }

  for (const rule of SEED_RULES) {
    if (!rule.name) continue;
    await ComplianceRuleModel.findOneAndUpdate({ name: rule.name }, rule, { upsert: true });
  }

  // Retire legacy duplicate rule names from early MVP seed (optional cleanup)
  await ComplianceRuleModel.deleteMany({
    name: { $in: ['PF Clause for Low Salary', 'Tamil Nadu Shops Act'] }
  });

  console.log('Seeding completed. Demo user ObjectId:', DEMO_USER_OBJECT_ID);
  process.exit(0);
}

seedData().catch(console.error);
