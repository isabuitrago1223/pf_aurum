import type { Request, Response } from 'express';
import { z } from 'zod';

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

  return res.json({ products });
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

const createProductSchema = z.object({
  sku: z.string().min(1).max(60),
  nombre: z.string().min(1).max(150),
  slug: z.string().min(1).max(180),
  descripcion: z.string().min(1),
  precio: z.coerce.number().positive(),
  precioAnterior: z.coerce.number().positive().optional(),
  costo: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0).default(0),
  stockMinimo: z.coerce.number().int().min(0).default(0),

  imagen: z.string().url().max(500),

  imagenAlt: z.string().max(180).optional(),
  tiempoEntrega: z.string().min(1).max(100),
  pesoGramos: z.coerce.number().int().positive().optional(),
  permitirPersonalizacion: z.boolean().default(false),
  opcionesPersonalizacion: z.any().optional(),
  destacado: z.boolean().default(false),
  activo: z.boolean().default(true),
  categoryId: z.string().min(1),
  occasionId: z.string().min(1).optional()
});

export async function createProduct(req: Request, res: Response) {
  const result = createProductSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Datos del producto inválidos.',
      errors: result.error.flatten()
    });
  }

  const data = result.data;

  const existingProduct = await prisma.product.findFirst({
    where: {
      OR: [
        { sku: data.sku },
        { slug: data.slug }
      ]
    }
  });

  if (existingProduct) {
    return res.status(409).json({
      message: 'Ya existe un producto con ese SKU o slug.'
    });
  }

  const category = await prisma.category.findUnique({
    where: {
      id: data.categoryId
    }
  });

  if (!category) {
    return res.status(404).json({
      message: 'Categoría no encontrada.'
    });
  }

  if (data.occasionId) {
    const occasion = await prisma.occasion.findUnique({
      where: {
        id: data.occasionId
      }
    });

    if (!occasion) {
      return res.status(404).json({
        message: 'Ocasión no encontrada.'
      });
    }
  }

  const product = await prisma.product.create({
    data: {
      sku: data.sku,
      nombre: data.nombre,
      slug: data.slug,
      descripcion: data.descripcion,
      precio: data.precio,
      precioAnterior: data.precioAnterior,
      costo: data.costo,
      stock: data.stock,
      stockMinimo: data.stockMinimo,
      imagen: data.imagen,
      imagenAlt: data.imagenAlt,
      tiempoEntrega: data.tiempoEntrega,
      pesoGramos: data.pesoGramos,
      permitirPersonalizacion: data.permitirPersonalizacion,
      opcionesPersonalizacion: data.opcionesPersonalizacion,
      destacado: data.destacado,
      activo: data.activo,
      categoryId: data.categoryId,
      occasionId: data.occasionId
    },
    include: {
      category: true,
      occasion: true
    }
  });

  return res.status(201).json({
    message: 'Producto creado correctamente.',
    product
  });
}

const updateProductSchema = createProductSchema.partial();

export async function updateProduct(req: Request, res: Response) {
  const idParam = req.params.id;

  const id = Array.isArray(idParam)
    ? idParam[0]
    : idParam;

  if (!id) {
    return res.status(400).json({
      message: 'El id del producto es requerido.'
    });
  }

  const result = updateProductSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Datos del producto inválidos.',
      errors: result.error.flatten()
    });
  }

  const existingProduct = await prisma.product.findUnique({
    where: {
      id
    }
  });

  if (!existingProduct) {
    return res.status(404).json({
      message: 'Producto no encontrado.'
    });
  }

  const data = result.data;

  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: {
        id: data.categoryId
      }
    });

    if (!category) {
      return res.status(404).json({
        message: 'Categoría no encontrada.'
      });
    }
  }

  if (data.occasionId) {
    const occasion = await prisma.occasion.findUnique({
      where: {
        id: data.occasionId
      }
    });

    if (!occasion) {
      return res.status(404).json({
        message: 'Ocasión no encontrada.'
      });
    }
  }

  if (data.sku || data.slug) {
    const duplicateProduct = await prisma.product.findFirst({
      where: {
        id: {
          not: id
        },
        OR: [
          ...(data.sku ? [{ sku: data.sku }] : []),
          ...(data.slug ? [{ slug: data.slug }] : [])
        ]
      }
    });

    if (duplicateProduct) {
      return res.status(409).json({
        message: 'Ya existe otro producto con ese SKU o slug.'
      });
    }
  }

  const product = await prisma.product.update({
    where: {
      id
    },
    data,
    include: {
      category: true,
      occasion: true
    }
  });

  return res.json({
    message: 'Producto actualizado correctamente.',
    product
  });
}

export async function updateProductStatus(
  req: Request,
  res: Response
) {
  const idParam = req.params.id;

  const id = Array.isArray(idParam)
    ? idParam[0]
    : idParam;

  if (!id) {
    return res.status(400).json({
      message: 'El id del producto es requerido.'
    });
  }

  const result = z
    .object({
      activo: z.boolean()
    })
    .safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Estado del producto inválido.',
      errors: result.error.flatten()
    });
  }

  const existingProduct = await prisma.product.findUnique({
    where: {
      id
    }
  });

  if (!existingProduct) {
    return res.status(404).json({
      message: 'Producto no encontrado.'
    });
  }

  const product = await prisma.product.update({
    where: {
      id
    },
    data: {
      activo: result.data.activo
    }
  });

  return res.json({
    message: result.data.activo
      ? 'Producto activado correctamente.'
      : 'Producto desactivado correctamente.',
    product
  });
}

export async function getAdminProducts(
  _req: Request,
  res: Response
) {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      category: true,
      occasion: true
    }
  });

  return res.json({
    products
  });
}