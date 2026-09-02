import { Router } from 'express';

import {
  createProduct,
  getProductBySlug,
  getProducts
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

productRouter.get('/:slug', getProductBySlug);

