import mongoose from 'mongoose';

export type ClauseCategory = 'pf' | 'esi' | 'shops_act' | 'general';

export interface IClause {
  slug: string;
  title: string;
  category: ClauseCategory;
  body: string;
  /** Empty or missing = applies to all states (India-wide). */
  states: string[];
  tags: string[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ClauseSchema = new mongoose.Schema<IClause>(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['pf', 'esi', 'shops_act', 'general']
    },
    body: { type: String, required: true },
    states: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

ClauseSchema.index({ category: 1, sortOrder: 1 });

export const ClauseModel = mongoose.model<IClause>('Clause', ClauseSchema);
