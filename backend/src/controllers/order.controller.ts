import type { Response } from 'express';
import { z } from 'zod';

import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { AppError } from '../utils/app-error.js';

const createOrderSchema = z.object({
  metodoEntrega: z.enum(['DOMICILIO', 'TIENDA']),
  nombreContacto: z.string().trim().min(2).max(160),
  cedulaContacto: z.string().trim().max(15).optional(),
  emailContacto: z.string().trim().email().max(120),
  telefonoContacto: z.string().trim().min(7).max(20),

  direccionEntrega: z.string().trim().max(160).optional(),
  barrioEntrega: z.string().trim().max(80).optional(),
  ciudadEntrega: z.string().trim().max(80).optional(),
  departamentoEntrega: z.string().trim().max(80).optional(),
  notasEntrega: z.string().trim().max(500).optional(),

  items: z.array(
    z.object({
      productId: z.string().min(1),
      cantidad: z.coerce.number().int().positive(),
      personalizacion: z.any().optional()
    })
  ).min(1)
});

export async function createOrder(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.auth) {
    throw new AppError(401, 'Autenticacion requerida.');
  }

  const data = createOrderSchema.parse(req.body);

  if (
    data.metodoEntrega === 'DOMICILIO' &&
    (
      !data.direccionEntrega ||
      !data.barrioEntrega ||
      !data.ciudadEntrega ||
      !data.departamentoEntrega
    )
  ) {
    throw new AppError(
      400,
      'La direccion completa es requerida para entrega a domicilio.'
    );
  }

  const productIds = [...new Set(
    data.items.map((item) => item.productId)
  )];

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds
      },
      activo: true
    }
  });

  if (products.length !== productIds.length) {
    throw new AppError(
      404,
      'Uno o mas productos no existen o no estan disponibles.'
    );
  }

  const productsById = new Map(
    products.map((product) => [product.id, product])
  );

  let subtotal = 0;

  const orderItems = data.items.map((item) => {
    const product = productsById.get(item.productId);

    if (!product) {
      throw new AppError(
        404,
        'Producto no encontrado.'
      );
    }

    if (product.stock < item.cantidad) {
      throw new AppError(
        409,
        `Stock insuficiente para ${product.nombre}.`
      );
    }

    const precioUnitario = Number(product.precio);

    subtotal += precioUnitario * item.cantidad;

    return {
      productId: product.id,
      nombreProducto: product.nombre,
      imagenProducto: product.imagen,
      cantidad: item.cantidad,
      precioUnitario,
      personalizacion: item.personalizacion
    };
  });

  // El costo de envio se mantiene en 0 hasta definir
  // las tarifas de domicilio del negocio.
  const costoEnvio = 0;
  const descuento = 0;
  const total = subtotal + costoEnvio - descuento;

  const numeroPedido = `AUR-${Date.now()}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  const order = await prisma.$transaction(async (tx) => {
    for (const item of data.items) {
      const updated = await tx.product.updateMany({
        where: {
          id: item.productId,
          activo: true,
          stock: {
            gte: item.cantidad
          }
        },
        data: {
          stock: {
            decrement: item.cantidad
          }
        }
      });

      if (updated.count !== 1) {
        throw new AppError(
          409,
          'El stock de uno de los productos cambio. Intenta nuevamente.'
        );
      }
    }

    return tx.order.create({
      data: {
        numeroPedido,
        userId: req.auth!.userId,
        metodoEntrega: data.metodoEntrega,
        nombreContacto: data.nombreContacto,
        cedulaContacto: data.cedulaContacto,
        emailContacto: data.emailContacto,
        telefonoContacto: data.telefonoContacto,

        direccionEntrega:
          data.metodoEntrega === 'DOMICILIO'
            ? data.direccionEntrega
            : null,

        barrioEntrega:
          data.metodoEntrega === 'DOMICILIO'
            ? data.barrioEntrega
            : null,

        ciudadEntrega:
          data.metodoEntrega === 'DOMICILIO'
            ? data.ciudadEntrega
            : null,

        departamentoEntrega:
          data.metodoEntrega === 'DOMICILIO'
            ? data.departamentoEntrega
            : null,

        notasEntrega: data.notasEntrega,
        costoEnvio,
        subtotal,
        descuento,
        total,

        items: {
          create: orderItems
        }
      },
      include: {
        items: true
      }
    });
  });

  return res.status(201).json({
    message: 'Pedido creado correctamente.',
    order
  });
}

export async function listMyOrders(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.auth) {
    throw new AppError(401, 'Autenticacion requerida.');
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: req.auth.userId
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      items: true
    }
  });

  return res.status(200).json({
    orders
  });
}