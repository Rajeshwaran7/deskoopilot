import { TemplateRepository } from '../repositories/template.repository.js';
import type { ITemplate } from '../models/Template.model.js';

export class TemplateService {
  private repository = new TemplateRepository();

  async createTemplate(data: Partial<ITemplate>) {
    return this.repository.create(data);
  }

  async getTemplates() {
    return this.repository.findAll();
  }

  async getTemplateById(id: string) {
    return this.repository.findById(id);
  }
}
