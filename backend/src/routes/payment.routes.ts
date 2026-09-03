import { Router } from 'express';

import {
  createPayment
} from '../controllers/payment.controller.js';
import { asyncHandler } from '../middlewares/async-handler.middleware.js';
import {
  requireAuth,
  requireRole
} from '../middlewares/auth.middleware.js';

export const paymentRouter = Router();

paymentRouter.post(
  '/',
  requireAuth,
  requireRole('CLIENTE'),
  asyncHandler(createPayment)
);