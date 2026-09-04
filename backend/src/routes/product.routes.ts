import { Router } from 'express';

import {
  addProductImage,
  createProduct,
  getAdminProducts,
  getProductBySlug,
  getProducts,
  updateProduct,
  updateProductStatus
} from '../controllers/product.controller.js';

import {
  requireAuth,
  requireRole
} from '../middlewares/auth.middleware.js';

export const productRouter = Router();
// Agregar imagen a la galeria de un producto - solo ADMIN

productRouter.post(
  '/:id/images',
  requireAuth,
  requireRole('ADMIN'),
  addProductImage
);
// Obtener productos activos para el catálogo público
productRouter.get('/', getProducts);

// Crear producto - solo ADMIN
productRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  createProduct
);

// Actualizar producto - solo ADMIN
productRouter.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  updateProduct
);

// Activar o desactivar producto - solo ADMIN
productRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  updateProductStatus
);

// Obtener todos los productos, activos e inactivos - solo ADMIN
productRouter.get(
  '/admin',
  requireAuth,
  requireRole('ADMIN'),
  getAdminProducts
);

// Obtener detalle público de un producto por slug
// Esta ruta debe permanecer después de /admin
productRouter.get('/:slug', getProductBySlug);