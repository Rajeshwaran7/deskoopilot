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
}
