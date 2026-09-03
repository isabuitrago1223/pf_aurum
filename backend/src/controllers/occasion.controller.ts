import { z } from 'zod';
import type { Request, Response } from 'express';

import { prisma } from '../config/prisma.js';

export async function getOccasions(_req: Request, res: Response) {
  const occasions = await prisma.occasion.findMany({
    where: {
      activo: true
    },
    orderBy: {
      nombre: 'asc'
    },
    select: {
      id: true,
      nombre: true,
      slug: true,
      descripcion: true
    }
  });

  return res.json({ occasions });
}

export async function getAdminOccasions(_req: Request, res: Response) {
  const occasions = await prisma.occasion.findMany({
    orderBy: {
      nombre: 'asc'
    }
  });

  return res.json({ occasions });
}

const createOccasionSchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(100),
  descripcion: z.string().trim().max(255).optional(),
  activo: z.boolean().default(true)
});

export async function createOccasion(req: Request, res: Response) {
  const result = createOccasionSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Datos de la ocasión inválidos.',
      errors: result.error.flatten()
    });
  }

  const data = result.data;

  const existingOccasion = await prisma.occasion.findFirst({
    where: {
      OR: [
        {
          nombre: data.nombre
        },
        {
          slug: data.slug
        }
      ]
    }
  });

  if (existingOccasion) {
    return res.status(409).json({
      message: 'Ya existe una ocasión con ese nombre o slug.'
    });
  }

  const occasion = await prisma.occasion.create({
    data
  });

  return res.status(201).json({
    message: 'Ocasión creada correctamente.',
    occasion
  });
}

const updateOccasionSchema = createOccasionSchema.partial();

export async function updateOccasion(req: Request, res: Response) {
  const idParam = req.params.id;

  const id = Array.isArray(idParam)
    ? idParam[0]
    : idParam;

  if (!id) {
    return res.status(400).json({
      message: 'El id de la ocasión es requerido.'
    });
  }

  const result = updateOccasionSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Datos de la ocasión inválidos.',
      errors: result.error.flatten()
    });
  }

  const existingOccasion = await prisma.occasion.findUnique({
    where: {
      id
    }
  });

  if (!existingOccasion) {
    return res.status(404).json({
      message: 'Ocasión no encontrada.'
    });
  }

  const data = result.data;

  if (data.nombre || data.slug) {
    const duplicateOccasion = await prisma.occasion.findFirst({
      where: {
        id: {
          not: id
        },
        OR: [
          ...(data.nombre ? [{ nombre: data.nombre }] : []),
          ...(data.slug ? [{ slug: data.slug }] : [])
        ]
      }
    });

    if (duplicateOccasion) {
      return res.status(409).json({
        message: 'Ya existe otra ocasión con ese nombre o slug.'
      });
    }
  }

  const occasion = await prisma.occasion.update({
    where: {
      id
    },
    data
  });

  return res.json({
    message: 'Ocasión actualizada correctamente.',
    occasion
  });
}

export async function updateOccasionStatus(req: Request, res: Response) {
  const idParam = req.params.id;

  const id = Array.isArray(idParam)
    ? idParam[0]
    : idParam;

  if (!id) {
    return res.status(400).json({
      message: 'El id de la ocasión es requerido.'
    });
  }

  const result = z.object({
    activo: z.boolean()
  }).safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Estado de la ocasión inválido.',
      errors: result.error.flatten()
    });
  }

  const existingOccasion = await prisma.occasion.findUnique({
    where: {
      id
    }
  });

  if (!existingOccasion) {
    return res.status(404).json({
      message: 'Ocasión no encontrada.'
    });
  }

  const occasion = await prisma.occasion.update({
    where: {
      id
    },
    data: {
      activo: result.data.activo
    }
  });

  return res.json({
    message: result.data.activo
      ? 'Ocasión activada correctamente.'
      : 'Ocasión desactivada correctamente.',
    occasion
  });
}