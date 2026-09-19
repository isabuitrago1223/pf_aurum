import { Router } from 'express';

import { getAdminDashboard } from '../controllers/admin-dashboard.controller.js';
import {
  requireAuth,
  requireRole
} from '../middlewares/auth.middleware.js';

export const adminDashboardRouter = Router();

/**
 * @openapi
 * /api/admin/dashboard:
 *   get:
 *     tags:
 *       - Administracion
 *     summary: Obtener resumen del dashboard administrativo
 *     description: Retorna métricas generales de clientes, productos, pedidos, ventas y alertas de stock. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard administrativo obtenido correctamente.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 */
adminDashboardRouter.get(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  getAdminDashboard
);