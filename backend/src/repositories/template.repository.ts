import { TemplateModel, ITemplate } from '../models/Template.model.js';

export class TemplateRepository {
  async create(data: Partial<ITemplate>) {
    return TemplateModel.create(data);
  }

  async findAll() {
    return TemplateModel.find().sort({ createdAt: -1 }).lean();
  }

  async findById(id: string) {
    return TemplateModel.findById(id).lean();
  }
}
