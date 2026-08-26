import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { categoryRouter } from './routes/category.routes.js';


import { env } from './config/env.js';
import { healthRouter } from './routes/health.routes.js';

export const app = express();

app.disable('x-powered-by');

app.use(helmet());

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json({ limit: '100kb' }));

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: 'draft-8',
    legacyHeaders: false
  })
);

app.use('/api/health', healthRouter);
app.use('/api/categories', categoryRouter);