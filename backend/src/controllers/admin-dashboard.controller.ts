import type { Response } from 'express';

import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export async function getAdminDashboard(
  _req: AuthenticatedRequest,
  res: Response
) {
  const [
    totalClientes,
    clientesActivos,
    clientesSuspendidos,
    clientesPendientes,
    totalProductos,
    productosActivos,
    productos,
    totalPedidos,
    pedidosPendientes,
    pedidosEnPreparacion,
    pedidosEnCamino,
    pedidosEntregados,
    pedidosCancelados,
    ventasAprobadas,
    ultimosPedidos
  ] = await Promise.all([
    prisma.user.count({
      where: {
        role: 'CLIENTE'
      }
    }),

    prisma.user.count({
      where: {
        role: 'CLIENTE',
        estado: 'ACTIVO'
      }
    }),

    prisma.user.count({
      where: {
        role: 'CLIENTE',
        estado: 'SUSPENDIDO'
      }
    }),

    prisma.user.count({
      where: {
        role: 'CLIENTE',
        estado: 'PENDIENTE_VERIFICACION'
      }
    }),

    prisma.product.count(),

    prisma.product.count({
      where: {
        activo: true
      }
    }),

    prisma.product.findMany({
      where: {
        activo: true
      },
      select: {
        id: true,
        sku: true,
        nombre: true,
        stock: true,
        stockMinimo: true
      },
      orderBy: {
        stock: 'asc'
      }
    }),

    prisma.order.count(),

    prisma.order.count({
      where: {
        estado: 'PENDIENTE'
      }
    }),

    prisma.order.count({
      where: {
        estado: 'EN_PREPARACION'
      }
    }),

    prisma.order.count({
      where: {
        estado: 'EN_CAMINO'
      }
    }),

    prisma.order.count({
      where: {
        estado: 'ENTREGADO'
      }
    }),

    prisma.order.count({
      where: {
        estado: 'CANCELADO'
      }
    }),

    prisma.payment.aggregate({
      where: {
        estado: 'APROBADO'
      },
      _sum: {
        monto: true
      },
      _count: {
        id: true
      }
    }),

    prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        numeroPedido: true,
        estado: true,
        metodoEntrega: true,
        total: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true
          }
        }
      }
    })
  ]);

  const productosStockBajo = productos.filter(
    (producto) => producto.stock <= producto.stockMinimo
  );

  return res.status(200).json({
    resumen: {
      clientes: {
        total: totalClientes,
        activos: clientesActivos,
        suspendidos: clientesSuspendidos,
        pendientesVerificacion: clientesPendientes
      },

      productos: {
        total: totalProductos,
        activos: productosActivos,
        stockBajo: productosStockBajo.length
      },

      pedidos: {
        total: totalPedidos,
        pendientes: pedidosPendientes,
        enPreparacion: pedidosEnPreparacion,
        enCamino: pedidosEnCamino,
        entregados: pedidosEntregados,
        cancelados: pedidosCancelados
      },

      ventas: {
        pagosAprobados: ventasAprobadas._count.id,
        totalAprobado: Number(
          ventasAprobadas._sum.monto ?? 0
        )
      }
    },

    alertas: {
      productosStockBajo
    },

    ultimosPedidos
  });
}