import { Router } from 'express';

import {
  getAdminClientById,
  getAdminClients,
  updateClientStatus
} from '../controllers/client.controller.js';

import {
  requireAuth,
  requireRole
} from '../middlewares/auth.middleware.js';

export const clientRouter = Router();

/**
 * @openapi
 * /api/clients:
 *   get:
 *     tags:
 *       - Clientes
 *     summary: Obtener clientes
 *     description: Retorna los usuarios con rol CLIENTE. Permite filtrar por estado y buscar por nombre, apellido, correo o cédula. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: buscar
 *         required: false
 *         schema:
 *           type: string
 *         description: Texto para buscar por nombre, apellido, correo o cédula.
 *       - in: query
 *         name: estado
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - ACTIVO
 *             - SUSPENDIDO
 *             - PENDIENTE_VERIFICACION
 *         description: Estado del cliente.
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida correctamente.
 *       400:
 *         description: Filtros de clientes inválidos.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 */
clientRouter.get(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  getAdminClients
);

/**
 * @openapi
 * /api/clients/{id}:
 *   get:
 *     tags:
 *       - Clientes
 *     summary: Obtener detalle de un cliente
 *     description: Retorna los datos del cliente y su historial de pedidos. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente.
 *     responses:
 *       200:
 *         description: Cliente obtenido correctamente.
 *       400:
 *         description: El id del cliente es requerido.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *       404:
 *         description: Cliente no encontrado.
 */
clientRouter.get(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  getAdminClientById
);

/**
 * @openapi
 * /api/clients/{id}/status:
 *   patch:
 *     tags:
 *       - Clientes
 *     summary: Cambiar estado de un cliente
 *     description: Permite cambiar el estado de un usuario CLIENTE. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum:
 *                   - ACTIVO
 *                   - SUSPENDIDO
 *                   - PENDIENTE_VERIFICACION
 *                 example: SUSPENDIDO
 *     responses:
 *       200:
 *         description: Estado del cliente actualizado correctamente.
 *       400:
 *         description: Estado del cliente inválido.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *       404:
 *         description: Cliente no encontrado.
 */
clientRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  updateClientStatus
);