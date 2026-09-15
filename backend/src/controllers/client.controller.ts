import { z } from 'zod';
import type { Request, Response } from 'express';

import { prisma } from '../config/prisma.js';

const clientSelect = {
  id: true,
  nombre: true,
  apellido: true,
  cedula: true,
  telefono: true,
  direccion: true,
  barrio: true,
  ciudad: true,
  departamento: true,
  fechaNacimiento: true,
  email: true,
  authProvider: true,
  role: true,
  estado: true,
  emailVerifiedAt: true,
  acceptedTermsAt: true,
  acceptedPrivacyAt: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true
} as const;

export async function getAdminClients(req: Request, res: Response) {
  const querySchema = z.object({
    buscar: z.string().trim().optional(),
    estado: z.enum([
      'ACTIVO',
      'SUSPENDIDO',
      'PENDIENTE_VERIFICACION'
    ]).optional()
  });

  const result = querySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      message: 'Filtros de clientes inválidos.',
      errors: result.error.flatten()
    });
  }

  const { buscar, estado } = result.data;

  const clients = await prisma.user.findMany({
    where: {
      role: 'CLIENTE',
      ...(estado
        ? {
            estado
          }
        : {}),
      ...(buscar
        ? {
            OR: [
              {
                nombre: {
                  contains: buscar
                }
              },
              {
                apellido: {
                  contains: buscar
                }
              },
              {
                email: {
                  contains: buscar
                }
              },
              {
                cedula: {
                  contains: buscar
                }
              }
            ]
          }
        : {})
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: clientSelect
  });

  return res.json({
    clients
  });
}

export async function getAdminClientById(req: Request, res: Response) {
  const idParam = req.params.id;

  const id = Array.isArray(idParam)
    ? idParam[0]
    : idParam;

  if (!id) {
    return res.status(400).json({
      message: 'El id del cliente es requerido.'
    });
  }

  const client = await prisma.user.findFirst({
    where: {
      id,
      role: 'CLIENTE'
    },
    select: {
      ...clientSelect,
      orders: {
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          numeroPedido: true,
          estado: true,
          metodoEntrega: true,
          subtotal: true,
          costoEnvio: true,
          descuento: true,
          total: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });

  if (!client) {
    return res.status(404).json({
      message: 'Cliente no encontrado.'
    });
  }

  return res.json({
    client
  });
}

const updateClientStatusSchema = z.object({
  estado: z.enum([
    'ACTIVO',
    'SUSPENDIDO',
    'PENDIENTE_VERIFICACION'
  ])
});

export async function updateClientStatus(req: Request, res: Response) {
  const idParam = req.params.id;

  const id = Array.isArray(idParam)
    ? idParam[0]
    : idParam;

  if (!id) {
    return res.status(400).json({
      message: 'El id del cliente es requerido.'
    });
  }

  const result = updateClientStatusSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Estado del cliente inválido.',
      errors: result.error.flatten()
    });
  }

  const existingClient = await prisma.user.findFirst({
    where: {
      id,
      role: 'CLIENTE'
    },
    select: {
      id: true
    }
  });

  if (!existingClient) {
    return res.status(404).json({
      message: 'Cliente no encontrado.'
    });
  }

  const client = await prisma.user.update({
    where: {
      id
    },
    data: {
      estado: result.data.estado
    },
    select: clientSelect
  });

  return res.json({
    message: 'Estado del cliente actualizado correctamente.',
    client
  });
}