import mongoose from 'mongoose';

export interface IComplianceIssue {
  rule: string;
  detail: string;
}

export interface IVersionSnapshot {
  version: number;
  generatedContent: string;
  variables: Record<string, unknown>;
  riskScore: number;
  suggestions: string[];
  complianceIssues: IComplianceIssue[];
  savedAt: Date;
  source: 'generate' | 'ai_edit' | 'auto_fix' | 'suggest_compliant' | 'manual';
}

export interface IApprovalEvent {
  at: Date;
  role: 'hr' | 'manager' | 'system';
  action: 'submit' | 'hr_approve' | 'manager_approve' | 'reject';
  note?: string;
  actorUserId?: string;
}

export type ApprovalStage = 'none' | 'pending_hr' | 'pending_manager' | 'approved' | 'rejected';

export interface IDocument {
  userId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  generatedContent: string;
  variables: Record<string, unknown>;
  riskScore: number;
  suggestions: string[];
  complianceIssues: IComplianceIssue[];
  status: 'draft' | 'review' | 'final';
  version: number;
  versionHistory: IVersionSnapshot[];
  approvalStage: ApprovalStage;
  approvalEvents: IApprovalEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const VersionSnapshotSchema = new mongoose.Schema<IVersionSnapshot>(
  {
    version: { type: Number, required: true },
    generatedContent: { type: String, required: true },
    variables: { type: Object, default: {} },
    riskScore: { type: Number, default: 0 },
    suggestions: { type: [String], default: [] },
    complianceIssues: {
      type: [{ rule: String, detail: String }],
      default: []
    },
    savedAt: { type: Date, default: Date.now },
    source: {
      type: String,
      enum: ['generate', 'ai_edit', 'auto_fix', 'suggest_compliant', 'manual'],
      required: true
    }
  },
  { _id: false }
);

const ApprovalEventSchema = new mongoose.Schema<IApprovalEvent>(
  {
    at: { type: Date, default: Date.now },
    role: { type: String, enum: ['hr', 'manager', 'system'], required: true },
    action: {
      type: String,
      enum: ['submit', 'hr_approve', 'manager_approve', 'reject'],
      required: true
    },
    note: { type: String },
    actorUserId: { type: String }
  },
  { _id: false }
);

const DocumentSchema = new mongoose.Schema<IDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
    generatedContent: { type: String, required: true },
    variables: { type: Object, default: {} },
    riskScore: { type: Number, default: 0 },
    suggestions: { type: [String], default: [] },
    complianceIssues: {
      type: [
        {
          rule: String,
          detail: String
        }
      ],
      default: []
    },
    status: { type: String, enum: ['draft', 'review', 'final'], default: 'draft' },
    version: { type: Number, default: 1 },
    versionHistory: { type: [VersionSnapshotSchema], default: [] },
    approvalStage: {
      type: String,
      enum: ['none', 'pending_hr', 'pending_manager', 'approved', 'rejected'],
      default: 'none'
    },
    approvalEvents: { type: [ApprovalEventSchema], default: [] }
  },
  { timestamps: true }
);

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);
