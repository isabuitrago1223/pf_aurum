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

/**
 * @openapi
 * /api/categories:
 *   get:
 *     tags:
 *       - Categorias
 *     summary: Obtener categorías activas
 *     description: Retorna las categorías activas del catálogo público.
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida correctamente.
 */
categoryRouter.get('/', getCategories);

/**
 * @openapi
 * /api/categories/admin:
 *   get:
 *     tags:
 *       - Categorias
 *     summary: Obtener todas las categorías
 *     description: Retorna categorías activas e inactivas. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de categorías obtenida correctamente.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 */
categoryRouter.get(
  '/admin',
  requireAuth,
  requireRole('ADMIN'),
  getAdminCategories
);

/**
 * @openapi
 * /api/categories:
 *   post:
 *     tags:
 *       - Categorias
 *     summary: Crear una categoría
 *     description: Crea una nueva categoría. Requiere rol ADMIN.
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
 *               - descripcion
 *               - imagen
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 80
 *                 example: Flores
 *               slug:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: flores
 *               descripcion:
 *                 type: string
 *                 example: Arreglos florales para diferentes ocasiones.
 *               imagen:
 *                 type: string
 *                 maxLength: 500
 *                 example: /images/categorias/flores.png
 *               activo:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *               orden:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *                 example: 1
 *     responses:
 *       201:
 *         description: Categoría creada correctamente.
 *       400:
 *         description: Datos de la categoría inválidos.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *       409:
 *         description: Ya existe una categoría con ese nombre o slug.
 */
categoryRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  createCategory
);

/**
 * @openapi
 * /api/categories/{id}:
 *   put:
 *     tags:
 *       - Categorias
 *     summary: Actualizar una categoría
 *     description: Actualiza los campos enviados de una categoría existente. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la categoría.
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
 *               imagen:
 *                 type: string
 *                 maxLength: 500
 *               activo:
 *                 type: boolean
 *               orden:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Categoría actualizada correctamente.
 *       400:
 *         description: Datos de la categoría inválidos.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *       404:
 *         description: Categoría no encontrada.
 *       409:
 *         description: Ya existe otra categoría con ese nombre o slug.
 */
categoryRouter.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  updateCategory
);

/**
 * @openapi
 * /api/categories/{id}/status:
 *   patch:
 *     tags:
 *       - Categorias
 *     summary: Activar o desactivar una categoría
 *     description: Cambia el estado activo de una categoría. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la categoría.
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
 *         description: Estado de la categoría actualizado correctamente.
 *       400:
 *         description: Estado de la categoría inválido.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *       404:
 *         description: Categoría no encontrada.
 */
categoryRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  updateCategoryStatus
);