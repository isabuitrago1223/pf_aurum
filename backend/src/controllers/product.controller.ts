import type { Request, Response } from 'express';

import { prisma } from '../config/prisma.js';

export async function getProducts(_req: Request, res: Response) {
  const products = await prisma.product.findMany({
    where: {
      activo: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      sku: true,
      nombre: true,
      slug: true,
      descripcion: true,
      precio: true,
      precioAnterior: true,
      stock: true,
      imagen: true,
      imagenAlt: true,
      tiempoEntrega: true,
      permitirPersonalizacion: true,
      destacado: true,
      category: {
        select: {
          id: true,
          nombre: true,
          slug: true
        }
      },
      occasion: {
        select: {
          id: true,
          nombre: true,
          slug: true
        }
      }
    }
  });

  res.json({ products });
}