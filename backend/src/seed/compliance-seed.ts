import type { IClause } from '../models/Clause.model.js';
import type { IComplianceRule } from '../models/ComplianceRule.model.js';

export const SEED_CLAUSES: Partial<IClause>[] = [
  {
    slug: 'pf-epf-basic',
    title: 'Employees Provident Fund (EPF) — basic coverage',
    category: 'pf',
    body: 'Subject to applicability under the Employees’ Provident Funds and Miscellaneous Provisions Act, 1952, the employee shall be enrolled for EPF and contributions shall be made as per the statutory rates (employer and employee share) on qualifying wages.',
    states: [],
    tags: ['pf', 'epf', 'india'],
    sortOrder: 1
  },
  {
    slug: 'pf-epf-sub-15k',
    title: 'EPF — mandatory for eligible employees below wage threshold',
    category: 'pf',
    body: 'Where the employee is covered under the EPF Act and monthly pay is within the statutory threshold commonly associated with mandatory EPF membership, EPF membership and contributions are mandatory unless a valid exemption applies.',
    states: [],
    tags: ['pf', 'threshold'],
    sortOrder: 2
  },
  {
    slug: 'esi-registration',
    title: 'ESI — employer registration obligation (illustrative threshold)',
    category: 'esi',
    body: 'Where the establishment crosses the applicable employee strength under the ESI Act and the employee’s wages are within the insurable wage ceiling, the employer must maintain ESI registration and comply with contribution and benefit obligations.',
    states: [],
    tags: ['esi', 'registration'],
    sortOrder: 10
  },
  {
    slug: 'esi-wage-ceiling',
    title: 'ESI — insurable wage ceiling (review current notification)',
    category: 'esi',
    body: 'Confirm the employee’s gross wages against the insurable wage ceiling notified under the ESI Act from time to time; enroll eligible employees and deduct/deposit contributions within statutory timelines.',
    states: [],
    tags: ['esi', 'wage'],
    sortOrder: 11
  },
  {
    slug: 'shops-tn-1947',
    title: 'Tamil Nadu — Shops and Establishments Act, 1947',
    category: 'shops_act',
    body: 'Employment terms shall comply with the Tamil Nadu Shops and Establishments Act, 1947 and applicable rules (registration, hours, holidays, leave, and records as prescribed).',
    states: ['Tamil Nadu'],
    tags: ['shops', 'tn'],
    sortOrder: 20
  },
  {
    slug: 'shops-ka-1961',
    title: 'Karnataka — Shops and Commercial Establishments Act, 1961',
    category: 'shops_act',
    body: 'Employment terms shall comply with the Karnataka Shops and Commercial Establishments Act, 1961 and applicable rules (registration, work hours, weekly holidays, leave, and registers).',
    states: ['Karnataka'],
    tags: ['shops', 'ka'],
    sortOrder: 21
  },
  {
    slug: 'shops-mh-1948',
    title: 'Maharashtra — Shops and Establishment Act, 1948',
    category: 'shops_act',
    body: 'Employment terms shall comply with the Maharashtra Shops and Establishment Act, 1948 and state rules (facilities, hours, leave, and maintenance of records).',
    states: ['Maharashtra'],
    tags: ['shops', 'mh'],
    sortOrder: 22
  },
  {
    slug: 'shops-dl-1954',
    title: 'Delhi — Shops and Establishments Act, 1954',
    category: 'shops_act',
    body: 'Employment terms shall comply with the Delhi Shops and Establishments Act, 1954 and applicable notifications (registration, working conditions, leave, and closures).',
    states: ['Delhi'],
    tags: ['shops', 'dl'],
    sortOrder: 23
  },
  {
    slug: 'shops-wb-1963',
    title: 'West Bengal — Shops and Establishments Act, 1963',
    category: 'shops_act',
    body: 'Employment terms shall comply with the West Bengal Shops and Establishments Act, 1963 and rules (registration, hours, holidays, leave, and employment certificates as applicable).',
    states: ['West Bengal'],
    tags: ['shops', 'wb'],
    sortOrder: 24
  },
  {
    slug: 'shops-gj-1948',
    title: 'Gujarat — Shops and Establishments Act, 1948',
    category: 'shops_act',
    body: 'Employment terms shall comply with the Gujarat Shops and Establishments Act, 1948 and applicable rules (registration, working hours, leave, and record-keeping).',
    states: ['Gujarat'],
    tags: ['shops', 'gj'],
    sortOrder: 25
  }
];

/** JSON Logic uses { var: 'variables.salary' } paths — normalized to numbers in RuleEngine. */
export const SEED_RULES: Partial<IComplianceRule>[] = [
  {
    name: 'PF — EPF clause for sub-threshold salary (illustrative ₹15,000)',
    description: 'Surface PF enrollment language when monthly salary is below common PF discussion threshold.',
    category: 'pf',
    region: 'India',
    severity: 'high',
    enabled: true,
    condition: { '<': [{ var: 'variables.salary' }, 15000] },
    action: { type: 'inject_clause', payload: '', clauseSlug: 'pf-epf-sub-15k' }
  },
  {
    name: 'PF — general EPF reference for covered establishments',
    description: 'Reminder to confirm EPF applicability for covered employees.',
    category: 'pf',
    region: 'India',
    severity: 'medium',
    enabled: true,
    condition: { '>=': [{ var: 'variables.salary' }, 15000] },
    action: { type: 'suggestion', payload: 'Confirm EPF applicability: for covered establishments, document PF enrollment, UAN, and contribution basis (qualifying wages) under the EPF Act.' }
  },
  {
    name: 'ESI — flag when strength and wage suggest coverage',
    description: 'Heuristic: employeeCount ≥ 10 and gross/monthly within common ESI ceiling band.',
    category: 'esi',
    region: 'India',
    severity: 'high',
    enabled: true,
    condition: {
      and: [
        { '>=': [{ var: 'variables.employeeCount' }, 10] },
        { '<=': [{ var: 'variables.grossSalary' }, 21000] }
      ]
    },
    action: { type: 'flag', payload: 'ESI may be applicable: verify establishment registration, employee headcount thresholds, and insurable wage ceiling under the ESI Act.', clauseSlug: 'esi-registration' }
  },
  {
    name: 'Shops Act — Tamil Nadu',
    description: 'Apply TN Shops Act clause when state is Tamil Nadu.',
    category: 'shops_act',
    region: 'Tamil Nadu',
    severity: 'high',
    enabled: true,
    condition: { '==': [{ var: 'variables.state' }, 'Tamil Nadu'] },
    action: { type: 'inject_clause', payload: '', clauseSlug: 'shops-tn-1947' }
  },
  {
    name: 'Shops Act — Karnataka',
    description: 'Apply Karnataka Shops Act clause.',
    category: 'shops_act',
    region: 'Karnataka',
    severity: 'high',
    enabled: true,
    condition: { '==': [{ var: 'variables.state' }, 'Karnataka'] },
    action: { type: 'inject_clause', payload: '', clauseSlug: 'shops-ka-1961' }
  },
  {
    name: 'Shops Act — Maharashtra',
    description: 'Apply Maharashtra Shops Act clause.',
    category: 'shops_act',
    region: 'Maharashtra',
    severity: 'high',
    enabled: true,
    condition: { '==': [{ var: 'variables.state' }, 'Maharashtra'] },
    action: { type: 'inject_clause', payload: '', clauseSlug: 'shops-mh-1948' }
  },
  {
    name: 'Shops Act — Delhi',
    description: 'Apply Delhi Shops Act clause.',
    category: 'shops_act',
    region: 'Delhi',
    severity: 'high',
    enabled: true,
    condition: { '==': [{ var: 'variables.state' }, 'Delhi'] },
    action: { type: 'inject_clause', payload: '', clauseSlug: 'shops-dl-1954' }
  },
  {
    name: 'Shops Act — West Bengal',
    description: 'Apply West Bengal Shops Act clause.',
    category: 'shops_act',
    region: 'West Bengal',
    severity: 'high',
    enabled: true,
    condition: { '==': [{ var: 'variables.state' }, 'West Bengal'] },
    action: { type: 'inject_clause', payload: '', clauseSlug: 'shops-wb-1963' }
  },
  {
    name: 'Shops Act — Gujarat',
    description: 'Apply Gujarat Shops Act clause.',
    category: 'shops_act',
    region: 'Gujarat',
    severity: 'high',
    enabled: true,
    condition: { '==': [{ var: 'variables.state' }, 'Gujarat'] },
    action: { type: 'inject_clause', payload: '', clauseSlug: 'shops-gj-1948' }
  },
  {
    name: 'State not specified — Shops & Establishments reminder',
    description: 'Prompt for state when placeholder left blank.',
    category: 'general',
    region: 'India',
    severity: 'low',
    enabled: true,
    condition: { '==': [{ var: 'variables.state' }, ''] },
    action: {
      type: 'suggestion',
      payload: 'Specify the work state to attach the correct Shops & Establishments Act obligations and registrations.'
    }
  }
];
