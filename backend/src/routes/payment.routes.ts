import { Router } from 'express';

import {
  createPayment,
  createWompiPayment,
  getWompiAcceptanceData,
  handleWompiWebhook,
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

paymentRouter.get(
  '/wompi/acceptance',
  requireAuth,
  requireRole('CLIENTE'),
  asyncHandler(getWompiAcceptanceData)
);

paymentRouter.post(
  '/wompi/webhook',
  asyncHandler(handleWompiWebhook)
);

paymentRouter.post(
  '/wompi',
  requireAuth,
  requireRole('CLIENTE'),
  asyncHandler(createWompiPayment)
);

paymentRouter.post(
  '/',
  requireAuth,
  requireRole('CLIENTE'),
  asyncHandler(createPayment)
);