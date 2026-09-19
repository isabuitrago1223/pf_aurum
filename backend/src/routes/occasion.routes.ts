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

/**
 * @openapi
 * /api/occasions:
 *   get:
 *     tags:
 *       - Ocasiones
 *     summary: Obtener ocasiones activas
 *     description: Retorna las ocasiones activas disponibles en el catálogo público.
 *     responses:
 *       200:
 *         description: Lista de ocasiones obtenida correctamente.
 */
occasionRouter.get('/', getOccasions);

/**
 * @openapi
 * /api/occasions/admin:
 *   get:
 *     tags:
 *       - Ocasiones
 *     summary: Obtener todas las ocasiones
 *     description: Retorna ocasiones activas e inactivas. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de ocasiones obtenida correctamente.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 */
occasionRouter.get(
  '/admin',
  requireAuth,
  requireRole('ADMIN'),
  getAdminOccasions
);

/**
 * @openapi
 * /api/occasions:
 *   post:
 *     tags:
 *       - Ocasiones
 *     summary: Crear una ocasión
 *     description: Crea una nueva ocasión. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - slug
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 80
 *                 example: Cumpleaños
 *               slug:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: cumpleanos
 *               descripcion:
 *                 type: string
 *                 maxLength: 255
 *                 example: Regalos y detalles especiales para celebrar cumpleaños.
 *               activo:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *     responses:
 *       201:
 *         description: Ocasión creada correctamente.
 *       400:
 *         description: Datos de la ocasión inválidos.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *       409:
 *         description: Ya existe una ocasión con ese nombre o slug.
 */
occasionRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  createOccasion
);

/**
 * @openapi
 * /api/occasions/{id}:
 *   put:
 *     tags:
 *       - Ocasiones
 *     summary: Actualizar una ocasión
 *     description: Actualiza los campos enviados de una ocasión existente. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la ocasión.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 80
 *               slug:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               descripcion:
 *                 type: string
 *                 maxLength: 255
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Ocasión actualizada correctamente.
 *       400:
 *         description: Datos de la ocasión inválidos.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *       404:
 *         description: Ocasión no encontrada.
 *       409:
 *         description: Ya existe otra ocasión con ese nombre o slug.
 */
occasionRouter.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  updateOccasion
);

/**
 * @openapi
 * /api/occasions/{id}/status:
 *   patch:
 *     tags:
 *       - Ocasiones
 *     summary: Activar o desactivar una ocasión
 *     description: Cambia el estado activo de una ocasión. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la ocasión.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activo
 *             properties:
 *               activo:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Estado de la ocasión actualizado correctamente.
 *       400:
 *         description: Estado de la ocasión inválido.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *       404:
 *         description: Ocasión no encontrada.
 */
occasionRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  updateOccasionStatus
);