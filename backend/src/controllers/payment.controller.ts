import type { Response } from 'express';
import { z } from 'zod';

import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { AppError } from '../utils/app-error.js';

const createPaymentSchema = z.object({
  orderId: z.string().min(1),
  metodo: z.enum([
    'NEQUI',
    'DAVIPLATA',
    'PSE',
    'TRANSFERENCIA_BANCARIA'
  ])
});

export async function createPayment(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.auth) {
    throw new AppError(
      401,
      'Autenticacion requerida.'
    );
  }

  const data = createPaymentSchema.parse(req.body);

  const order = await prisma.order.findFirst({
    where: {
      id: data.orderId,
      userId: req.auth.userId
    }
  });

  if (!order) {
    throw new AppError(
      404,
      'Pedido no encontrado.'
    );
  }

  if (order.estado === 'CANCELADO') {
    throw new AppError(
      409,
      'No es posible registrar un pago para un pedido cancelado.'
    );
  }

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      metodo: data.metodo,
      monto: order.total
    }
  });

  return res.status(201).json({
    message: 'Pago registrado correctamente.',
    payment
  });
}