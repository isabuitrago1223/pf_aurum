import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import {
  createWompiTransaction,
  getWompiMerchantInfo
} from '../services/wompi.service.js';
import { AppError } from '../utils/app-error.js';

type WompiEventData = Record<string, unknown>;

function getNestedValue(
  data: WompiEventData,
  path: string
): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (
      current &&
      typeof current === 'object' &&
      key in current
    ) {
      return (current as Record<string, unknown>)[key];
    }

    return undefined;
  }, data);
}

function validateWompiEventSignature(body: {
  data: WompiEventData;
  signature: {
    properties: string[];
    checksum: string;
  };
  timestamp: number;
}) {
  const concatenatedValues = body.signature.properties
    .map((property) => {
      const value = getNestedValue(body.data, property);

      if (value === undefined || value === null) {
        throw new AppError(
          400,
          'Evento de Wompi con propiedades de firma invalidas.'
        );
      }

      return String(value);
    })
    .join('');

  const rawSignature =
    concatenatedValues +
    String(body.timestamp) +
    env.WOMPI_EVENTS_SECRET;

  const expectedChecksum = createHash('sha256')
    .update(rawSignature)
    .digest('hex');

  const receivedChecksum = body.signature.checksum.toLowerCase();

  const expectedBuffer = Buffer.from(expectedChecksum, 'hex');
  const receivedBuffer = Buffer.from(receivedChecksum, 'hex');

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

const wompiWebhookSchema = z.object({
  event: z.string().min(1),
  data: z.record(z.unknown()),
  signature: z.object({
    properties: z.array(z.string().min(1)).min(1),
    checksum: z.string().regex(/^[a-fA-F0-9]{64}$/)
  }),
  timestamp: z.number()
});

const wompiWebhookTransactionSchema = z.object({
  id: z.string().min(1),
  reference: z.string().min(1),
  status: z.enum([
    'PENDING',
    'APPROVED',
    'DECLINED',
    'VOIDED',
    'ERROR'
  ]),
  amount_in_cents: z.number().int().nonnegative()
});

const createPaymentSchema = z.object({
  orderId: z.string().min(1),
  metodo: z.enum([
    'NEQUI',
    'DAVIPLATA',
    'PSE',
    'TRANSFERENCIA_BANCARIA'
  ])
});

export async function getWompiAcceptanceData(
  _req: Request,
  res: Response
) {
  const merchantInfo = await getWompiMerchantInfo();

  return res.status(200).json({
    acceptanceToken:
      merchantInfo.data.presigned_acceptance.acceptance_token,
    acceptancePermalink:
      merchantInfo.data.presigned_acceptance.permalink,
    personalDataAuthToken:
      merchantInfo.data.presigned_personal_data_auth.acceptance_token,
    personalDataAuthPermalink:
      merchantInfo.data.presigned_personal_data_auth.permalink
  });
}

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

export async function handleWompiWebhook(
  req: Request,
  res: Response
) {
  const body = wompiWebhookSchema.parse(req.body);

  const isValidSignature = validateWompiEventSignature(body);

  if (!isValidSignature) {
    throw new AppError(
      401,
      'Firma de evento de Wompi invalida.'
    );
  }

  if (body.event !== 'transaction.updated') {
    return res.status(200).json({
      message: 'Evento de Wompi ignorado.'
    });
  }

  const transaction = wompiWebhookTransactionSchema.parse(
    body.data.transaction
  );

  const payment = await prisma.payment.findFirst({
    where: {
      proveedorTransaccion: transaction.id
    }
  });

  if (!payment) {
    return res.status(200).json({
      message: 'Pago de Wompi no encontrado.'
    });
  }

  if (payment.referencia !== transaction.reference) {
    throw new AppError(
      409,
      'La referencia de Wompi no coincide con el pago registrado.'
    );
  }

  const expectedAmountInCents = Math.round(
    Number(payment.monto) * 100
  );

  if (expectedAmountInCents !== transaction.amount_in_cents) {
    throw new AppError(
      409,
      'El monto de Wompi no coincide con el pago registrado.'
    );
  }

  const newStatus =
    transaction.status === 'APPROVED'
      ? 'APROBADO'
      : transaction.status === 'DECLINED' ||
          transaction.status === 'VOIDED' ||
          transaction.status === 'ERROR'
        ? 'RECHAZADO'
        : 'PENDIENTE';

  const updatedPayment = await prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: {
        id: payment.id
      },
      data: {
        estado: newStatus,
        respuestaPasarela: JSON.parse(JSON.stringify(body)),
        ...(newStatus === 'APROBADO' && !payment.pagadoAt
          ? { pagadoAt: new Date() }
          : {})
      }
    });

    if (newStatus === 'APROBADO') {
      await tx.order.updateMany({
        where: {
          id: payment.orderId,
          estado: 'PENDIENTE'
        },
        data: {
          estado: 'EN_PREPARACION'
        }
      });
    }

    return updated;
  });

  return res.status(200).json({
    message: 'Evento de Wompi procesado correctamente.',
    payment: updatedPayment
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
