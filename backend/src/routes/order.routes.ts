import { Router } from 'express';

import {
  createOrder,
  getMyOrderById,
  listAllOrders,
  listMyOrders,
  updateOrderStatus
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

orderRouter.get(
  '/admin',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(listAllOrders)
);

orderRouter.patch(
  '/admin/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(updateOrderStatus)
);

orderRouter.get(
  '/:id',
  requireAuth,
  requireRole('CLIENTE'),
  asyncHandler(getMyOrderById)
);

orderRouter.post(
  '/',
  requireAuth,
  requireRole('CLIENTE'),
  asyncHandler(createOrder)
);