import { ClauseModel, IClause } from '../models/Clause.model.js';

export class ClauseRepository {
  async findBySlug(slug: string) {
    return ClauseModel.findOne({ slug }).lean();
  }

  async findFiltered(filters: { state?: string; category?: string }) {
    const q: Record<string, unknown> = {};
    if (filters.category) {
      q.category = filters.category;
    }
    if (filters.state) {
      q.$or = [{ states: { $size: 0 } }, { states: filters.state }];
    }
    return ClauseModel.find(q).sort({ category: 1, sortOrder: 1, title: 1 }).lean();
  }

  async upsertMany(clauses: Partial<IClause>[]) {
    for (const c of clauses) {
      if (!c.slug) continue;
      await ClauseModel.findOneAndUpdate({ slug: c.slug }, c, { upsert: true });
    }
  }
}
