import express from 'express';
import { listClauses } from '../controllers/clause.controller.js';

export const clauseRouter = express.Router();

clauseRouter.get('/', listClauses);
