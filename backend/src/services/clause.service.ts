import { ClauseRepository } from '../repositories/clause.repository.js';

export class ClauseService {
  private repository = new ClauseRepository();

  list(filters: { state?: string; category?: string }) {
    return this.repository.findFiltered(filters);
  }
}
