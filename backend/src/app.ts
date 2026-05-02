import express from 'express';
import cors from 'cors';
import { json } from 'express';
import { templateRouter } from './routes/template.route.js';
import { documentRouter } from './routes/document.route.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';
import { loadEnvironment } from './config/env.js';

loadEnvironment();

const app = express();
app.use(cors());
app.use(json({ limit: '8mb' }));
app.use('/api/templates', templateRouter);
app.use('/api/documents', documentRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
