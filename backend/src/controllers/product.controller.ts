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

export async function getProductBySlug(req: Request, res: Response) {
  const slugParam = req.params.slug;

  const slug = Array.isArray(slugParam)
    ? slugParam[0]
    : slugParam;

  if (!slug) {
    return res.status(400).json({
      message: 'El slug del producto es requerido.'
    });
  }

  const product = await prisma.product.findUnique({
    where: {
      slug
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
      opcionesPersonalizacion: true,
      destacado: true,
      activo: true,
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
      },
      images: {
        orderBy: {
          orden: 'asc'
        },
        select: {
          id: true,
          url: true,
          alt: true,
          orden: true
        }
      }
    }
  });

  if (!product || !product.activo) {
    return res.status(404).json({
      message: 'Producto no encontrado.'
    });
  }

  return res.json({ product });
}