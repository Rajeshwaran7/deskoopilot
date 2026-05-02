import mongoose from 'mongoose';

export interface IComplianceIssue {
  rule: string;
  detail: string;
}

export interface IDocument {
  userId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  generatedContent: string;
  variables: Record<string, unknown>;
  riskScore: number;
  suggestions: string[];
  complianceIssues: IComplianceIssue[];
  status: 'draft' | 'review' | 'final';
  createdAt: Date;
  updatedAt: Date;
}

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
    status: { type: String, enum: ['draft', 'review', 'final'], default: 'draft' }
  },
  { timestamps: true }
);

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);
