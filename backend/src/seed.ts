import mongoose from 'mongoose';
import { TemplateModel } from './models/Template.model.js';
import { ComplianceRuleModel } from './models/ComplianceRule.model.js';
import { connectDatabase } from './config/database.js';
import { getConfig } from './config/env.js';

async function seedData() {
  await connectDatabase();

  // Seed templates
  const templates = [
    {
      name: 'Offer Letter - Entry Level',
      type: 'offer_letter',
      content: 'Dear {{candidateName}},\n\nWe are pleased to offer you the position of {{position}} at our company. Your starting salary will be {{salary}} per annum.\n\nBest regards,\nHR Team',
      placeholders: ['candidateName', 'position', 'salary'],
      ownerId: new mongoose.Types.ObjectId() // Mock owner
    },
    {
      name: 'Leave Policy',
      type: 'policy',
      content: 'This leave policy outlines the entitlements for employees. Annual leave is {{annualLeaveDays}} days.',
      placeholders: ['annualLeaveDays'],
      ownerId: new mongoose.Types.ObjectId()
    }
  ];

  for (const template of templates) {
    await TemplateModel.findOneAndUpdate({ name: template.name }, template, { upsert: true });
  }

  // Seed compliance rules
  const rules = [
    {
      name: 'PF Clause for Low Salary',
      description: 'Add PF clause if salary is below 15000',
      condition: { '<': [{ 'var': 'variables.salary' }, 15000] },
      action: { type: 'suggestion', payload: 'Include Provident Fund clause as per EPF Act.' },
      region: 'India',
      severity: 'medium'
    },
    {
      name: 'Tamil Nadu Shops Act',
      description: 'Include Shops Act clause for Tamil Nadu',
      condition: { '==': [{ 'var': 'variables.state' }, 'Tamil Nadu'] },
      action: { type: 'inject_clause', payload: 'This agreement is subject to the Tamil Nadu Shops and Establishments Act, 1947.' },
      region: 'Tamil Nadu',
      severity: 'high'
    }
  ];

  for (const rule of rules) {
    await ComplianceRuleModel.findOneAndUpdate({ name: rule.name }, rule, { upsert: true });
  }

  console.log('Seeding completed');
  process.exit(0);
}

seedData().catch(console.error);