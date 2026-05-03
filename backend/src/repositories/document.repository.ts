import mongoose from 'mongoose';
import { DocumentModel, IDocument } from '../models/Document.model.js';

export class DocumentRepository {
  async create(data: Partial<IDocument>) {
    return DocumentModel.create(data);
  }

  async update(id: string, data: Partial<IDocument>) {
    const updated = await DocumentModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!updated) {
      throw new Error('Document not found for update');
    }
    return updated;
  }

  async findById(id: string) {
    return DocumentModel.findById(id).lean();
  }

  async findByIdWithTemplate(id: string) {
    return DocumentModel.findById(id).populate('templateId', 'name type placeholders').lean();
  }

  async findAll(filters: { userId?: string }, limit = 50) {
    const q: Record<string, unknown> = {};
    if (filters.userId && mongoose.Types.ObjectId.isValid(filters.userId)) {
      q.userId = new mongoose.Types.ObjectId(filters.userId);
    }
    return DocumentModel.find(q)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate('templateId', 'name type')
      .lean();
  }

  async deleteById(id: string) {
    return DocumentModel.findByIdAndDelete(id).lean();
  }

  async rawUpdate(id: string, update: mongoose.UpdateQuery<IDocument>) {
    const updated = await DocumentModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) {
      throw new Error('Document not found for update');
    }
    return updated;
  }
}
