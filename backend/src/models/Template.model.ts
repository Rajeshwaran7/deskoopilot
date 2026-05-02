import mongoose from 'mongoose';

export interface ITemplate {
  name: string;
  type: 'offer_letter' | 'policy' | 'contract' | 'notice';
  content: string;
  placeholders: string[];
  metadata: {
    category?: string;
    description?: string;
  };
  ownerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new mongoose.Schema<ITemplate>(
  {
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['offer_letter', 'policy', 'contract', 'notice'] },
    content: { type: String, required: true },
    placeholders: { type: [String], default: [] },
    metadata: { type: Object, default: {} },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export const TemplateModel = mongoose.model<ITemplate>('Template', TemplateSchema);
