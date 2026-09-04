import { Router } from 'express';

import {
  createPayment,
  listAdminPayments,
  updateAdminPaymentStatus
} from '../controllers/payment.controller.js';
import { asyncHandler } from '../middlewares/async-handler.middleware.js';
import {
  requireAuth,
  requireRole
} from '../middlewares/auth.middleware.js';

export const paymentRouter = Router();

paymentRouter.get(
  '/admin',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(listAdminPayments)
);

paymentRouter.patch(
  '/admin/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(updateAdminPaymentStatus)
);

paymentRouter.post(
  '/',
  requireAuth,
  requireRole('CLIENTE'),
  asyncHandler(createPayment)
);