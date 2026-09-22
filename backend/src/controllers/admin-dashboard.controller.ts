import type { Response } from 'express';

import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export async function getAdminDashboard(
  _req: AuthenticatedRequest,
  res: Response
) {
  const totalClientes = await prisma.user.count({
    where: {
      role: 'CLIENTE'
    }
  });

  const clientesActivos = await prisma.user.count({
    where: {
      role: 'CLIENTE',
      estado: 'ACTIVO'
    }
  });

  const clientesSuspendidos = await prisma.user.count({
    where: {
      role: 'CLIENTE',
      estado: 'SUSPENDIDO'
    }
  });

  const clientesPendientes = await prisma.user.count({
    where: {
      role: 'CLIENTE',
      estado: 'PENDIENTE_VERIFICACION'
    }
  });

  const totalProductos = await prisma.product.count();

  const productosActivos = await prisma.product.count({
    where: {
      activo: true
    }
  });

  const productos = await prisma.product.findMany({
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
  });

  const totalPedidos = await prisma.order.count();

  const pedidosPendientes = await prisma.order.count({
    where: {
      estado: 'PENDIENTE'
    }
  });

  const pedidosEnPreparacion = await prisma.order.count({
    where: {
      estado: 'EN_PREPARACION'
    }
  });

  const pedidosEnCamino = await prisma.order.count({
    where: {
      estado: 'EN_CAMINO'
    }
  });

  const pedidosEntregados = await prisma.order.count({
    where: {
      estado: 'ENTREGADO'
    }
  });

  const pedidosCancelados = await prisma.order.count({
    where: {
      estado: 'CANCELADO'
    }
  });

  const ventasAprobadas = await prisma.payment.aggregate({
    where: {
      estado: 'APROBADO'
    },
    _sum: {
      monto: true
    },
    _count: {
      id: true
    }
  });

  const ultimosPedidos = await prisma.order.findMany({
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
  });

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