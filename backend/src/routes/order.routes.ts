import { Router } from 'express';

import { createOrder } from '../controllers/order.controller.js';
import { asyncHandler } from '../middlewares/async-handler.middleware.js';
import {
  requireAuth,
  requireRole
} from '../middlewares/auth.middleware.js';

export const orderRouter = Router();

orderRouter.post(
  '/',
  requireAuth,
  requireRole('CLIENTE'),
  asyncHandler(createOrder)
);