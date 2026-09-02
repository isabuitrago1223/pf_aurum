import { Router } from 'express';

import {
  createProduct,
  getProductBySlug,
  getProducts,
  updateProduct
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

productRouter.get('/:slug', getProductBySlug);