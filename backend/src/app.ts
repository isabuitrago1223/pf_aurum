import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { env } from './config/env.js';

import { errorHandler } from './middlewares/error.middleware.js';

import { authRouter } from './routes/auth.routes.js';
import { categoryRouter } from './routes/category.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { occasionRouter } from './routes/occasion.routes.js';
import { orderRouter } from './routes/order.routes.js';
import { paymentRouter } from './routes/payment.routes.js';
import { productRouter } from './routes/product.routes.js';
import { uploadRouter } from './routes/upload.routes.js';

export const app = express();

app.disable('x-powered-by');

app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true
  })
);

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

app.use('/api/products', productRouter);

app.use('/api/occasions', occasionRouter);

app.use('/api/orders', orderRouter);

app.use('/api/payments', paymentRouter);

app.use('/api/uploads', uploadRouter);

app.use('/api/auth', authRouter);

app.use(errorHandler);