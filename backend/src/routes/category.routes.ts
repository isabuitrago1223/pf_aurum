import { Router } from 'express';

import {
  createCategory,
  getAdminCategories,
  getCategories,
  updateCategory,
  updateCategoryStatus
} from '../controllers/category.controller.js';

import {
  requireAuth,
  requireRole
} from '../middlewares/auth.middleware.js';

export const categoryRouter = Router();

// Listado público de categorías activas
categoryRouter.get('/', getCategories);

// Listado administrativo de todas las categorías
categoryRouter.get(
  '/admin',
  requireAuth,
  requireRole('ADMIN'),
  getAdminCategories
);

// Crear categoría - solo ADMIN
categoryRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  createCategory
);

// Actualizar categoría - solo ADMIN
categoryRouter.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  updateCategory
);

// Activar o desactivar categoría - solo ADMIN
categoryRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  updateCategoryStatus
);