import { Router } from 'express';

import {
  createOccasion,
  getAdminOccasions,
  getOccasions,
  updateOccasion,
  updateOccasionStatus
} from '../controllers/occasion.controller.js';

import {
  requireAuth,
  requireRole
} from '../middlewares/auth.middleware.js';

export const occasionRouter = Router();

// Listado público de ocasiones activas
occasionRouter.get('/', getOccasions);

// Listado administrativo de todas las ocasiones
occasionRouter.get(
  '/admin',
  requireAuth,
  requireRole('ADMIN'),
  getAdminOccasions
);

// Crear ocasión - solo ADMIN
occasionRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  createOccasion
);

// Actualizar ocasión - solo ADMIN
occasionRouter.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  updateOccasion
);

// Activar o desactivar ocasión - solo ADMIN
occasionRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  updateOccasionStatus
);