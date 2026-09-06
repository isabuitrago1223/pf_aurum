import { z } from 'zod';
import type { Request, Response } from 'express';

import { prisma } from '../config/prisma.js';

export async function getCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({
    where: {
      activo: true
    },
    orderBy: {
      orden: 'asc'
    },
    select: {
      id: true,
      nombre: true,
      slug: true,
      descripcion: true,
      imagen: true,
      orden: true
    }
  });

  return res.json({ categories });
}

export async function getAdminCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({
    orderBy: [
      {
        orden: 'asc'
      },
      {
        nombre: 'asc'
      }
    ]
  });

  return res.json({ categories });
}

const createCategorySchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(100),
  descripcion: z.string().trim().min(1),
  imagen: z.string().trim().min(1).max(500),
  activo: z.boolean().default(true),
  orden: z.coerce.number().int().min(0).default(0)
});

export async function createCategory(req: Request, res: Response) {
  const result = createCategorySchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Datos de la categoría inválidos.',
      errors: result.error.flatten()
    });
  }

  const data = result.data;

  const existingCategory = await prisma.category.findFirst({
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

  if (existingCategory) {
    return res.status(409).json({
      message: 'Ya existe una categoría con ese nombre o slug.'
    });
  }

  const category = await prisma.category.create({
    data
  });

  return res.status(201).json({
    message: 'Categoría creada correctamente.',
    category
  });
}

const updateCategorySchema = createCategorySchema.partial();

export async function updateCategory(req: Request, res: Response) {
  const idParam = req.params.id;

  const id = Array.isArray(idParam)
    ? idParam[0]
    : idParam;

  if (!id) {
    return res.status(400).json({
      message: 'El id de la categoría es requerido.'
    });
  }

  const result = updateCategorySchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Datos de la categoría inválidos.',
      errors: result.error.flatten()
    });
  }

  const existingCategory = await prisma.category.findUnique({
    where: {
      id
    }
  });

  if (!existingCategory) {
    return res.status(404).json({
      message: 'Categoría no encontrada.'
    });
  }

  const data = result.data;

  if (data.nombre || data.slug) {
    const duplicateCategory = await prisma.category.findFirst({
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

    if (duplicateCategory) {
      return res.status(409).json({
        message: 'Ya existe otra categoría con ese nombre o slug.'
      });
    }
  }

  const category = await prisma.category.update({
    where: {
      id
    },
    data
  });

  return res.json({
    message: 'Categoría actualizada correctamente.',
    category
  });
}

export async function updateCategoryStatus(req: Request, res: Response) {
  const idParam = req.params.id;

  const id = Array.isArray(idParam)
    ? idParam[0]
    : idParam;

  if (!id) {
    return res.status(400).json({
      message: 'El id de la categoría es requerido.'
    });
  }

  const result = z.object({
    activo: z.boolean()
  }).safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Estado de la categoría inválido.',
      errors: result.error.flatten()
    });
  }

  const existingCategory = await prisma.category.findUnique({
    where: {
      id
    }
  });

  if (!existingCategory) {
    return res.status(404).json({
      message: 'Categoría no encontrada.'
    });
  }

  const category = await prisma.category.update({
    where: {
      id
    },
    data: {
      activo: result.data.activo
    }
  });

  return res.json({
    message: result.data.activo
      ? 'Categoría activada correctamente.'
      : 'Categoría desactivada correctamente.',
    category
  });
}