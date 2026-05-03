import { Request, Response, NextFunction } from 'express';
import { ClauseService } from '../services/clause.service.js';

const clauseService = new ClauseService();

export async function listClauses(req: Request, res: Response, next: NextFunction) {
  try {
    const state = typeof req.query.state === 'string' ? req.query.state : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const clauses = await clauseService.list({ state, category });
    res.json({ success: true, data: clauses });
  } catch (error) {
    next(error);
  }
}
