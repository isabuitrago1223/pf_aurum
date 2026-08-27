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

  res.json({ categories });
}