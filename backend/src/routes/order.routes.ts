import { Router } from 'express';

import {
  createOrder,
  listMyOrders
} from '../controllers/order.controller.js';
import { asyncHandler } from '../middlewares/async-handler.middleware.js';
import {
  requireAuth,
  requireRole
} from '../middlewares/auth.middleware.js';

export const orderRouter = Router();

orderRouter.get(
  '/my-orders',
  requireAuth,
  requireRole('CLIENTE'),
  asyncHandler(listMyOrders)
);

orderRouter.post(
  '/',
  requireAuth,
  requireRole('CLIENTE'),
  asyncHandler(createOrder)
);