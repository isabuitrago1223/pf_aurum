import type { Response } from 'express';
import { z } from 'zod';

import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { createWompiTransaction } from '../services/wompi.service.js';
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

const createWompiPaymentSchema = z.object({
  orderId: z.string().min(1),
  metodo: z.enum([
    'NEQUI',
    'DAVIPLATA',
    'PSE',
    'TRANSFERENCIA_BANCARIA'
  ]),
  acceptanceToken: z.string().min(1),
  acceptPersonalAuth: z.string().min(1),
  paymentMethod: z.record(z.unknown())
});
const updatePaymentStatusSchema = z.object({
  estado: z.enum([
    'PENDIENTE',
    'APROBADO',
    'RECHAZADO',
    'REEMBOLSADO'
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

  const existingPayment = await prisma.payment.findFirst({
    where: {
      orderId: order.id,
      estado: {
        in: ['PENDIENTE', 'APROBADO']
      }
    }
  });

  if (existingPayment) {
    throw new AppError(
      409,
      'Ya existe un pago pendiente o aprobado para este pedido.'
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

export async function createWompiPayment(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.auth) {
    throw new AppError(
      401,
      'Autenticacion requerida.'
    );
  }

  const data = createWompiPaymentSchema.parse(req.body);

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
      'No es posible iniciar un pago para un pedido cancelado.'
    );
  }

  const existingPayment = await prisma.payment.findFirst({
    where: {
      orderId: order.id,
      estado: {
        in: ['PENDIENTE', 'APROBADO']
      }
    }
  });

  if (existingPayment) {
    throw new AppError(
      409,
      'Ya existe un pago pendiente o aprobado para este pedido.'
    );
  }

  const amountInCents = Math.round(Number(order.total) * 100);
  const reference = `${order.numeroPedido}-${Date.now()}`;

  const wompiResponse = await createWompiTransaction({
    acceptanceToken: data.acceptanceToken,
    acceptPersonalAuth: data.acceptPersonalAuth,
    reference,
    amountInCents,
    customerEmail: order.emailContacto,
    paymentMethod: data.paymentMethod
  });

  const transaction = wompiResponse.data;

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      metodo: data.metodo,
      monto: order.total,
      referencia: reference,
      proveedorTransaccion: transaction.id,
      respuestaPasarela: JSON.parse(JSON.stringify(wompiResponse)),
      estado:
        transaction.status === 'APPROVED'
          ? 'APROBADO'
          : transaction.status === 'DECLINED' ||
              transaction.status === 'VOIDED' ||
              transaction.status === 'ERROR'
            ? 'RECHAZADO'
            : 'PENDIENTE',
      ...(transaction.status === 'APPROVED'
        ? { pagadoAt: new Date() }
        : {})
    }
  });

  return res.status(201).json({
    message: 'Transaccion de Wompi creada correctamente.',
    payment,
    transaction
  });
}

export async function listAdminPayments(
  req: AuthenticatedRequest,
  res: Response
) {
  const payments = await prisma.payment.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      order: {
        select: {
          id: true,
          numeroPedido: true,
          estado: true,
          total: true,
          user: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true
            }
          }
        }
      }
    }
  });

  return res.status(200).json({
    payments
  });
}

export async function updateAdminPaymentStatus(
  req: AuthenticatedRequest,
  res: Response
) {
  const paymentId = z.string().min(1).parse(req.params.id);
  const data = updatePaymentStatusSchema.parse(req.body);

  const existingPayment = await prisma.payment.findUnique({
    where: {
      id: paymentId
    }
  });

  if (!existingPayment) {
    throw new AppError(
      404,
      'Pago no encontrado.'
    );
  }

  const payment = await prisma.payment.update({
    where: {
      id: paymentId
    },
    data: {
      estado: data.estado,
      ...(data.estado === 'APROBADO' && !existingPayment.pagadoAt
        ? { pagadoAt: new Date() }
        : {})
    }
  });

  return res.status(200).json({
    message: 'Estado del pago actualizado correctamente.',
    payment
  });
}

