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

  res.json({ occasions });
}