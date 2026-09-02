import { Router } from 'express';

import {
  createProduct,
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

productRouter.get('/', getProducts);

productRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  createProduct
);

productRouter.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  updateProduct
);

productRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  updateProductStatus
);

productRouter.get('/:slug', getProductBySlug);