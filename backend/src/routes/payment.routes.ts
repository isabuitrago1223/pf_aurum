import { Router } from 'express';

import {
  createPayment,
  createWompiPayment,
  getWompiAcceptanceData,
  getWompiPaymentStatus,
  getWompiPseInstitutions,
  handleWompiWebhook,
  listAdminPayments,
  updateAdminPaymentStatus
} from '../controllers/payment.controller.js';
import { asyncHandler } from '../middlewares/async-handler.middleware.js';
import {
  requireAuth,
  requireRole
} from '../middlewares/auth.middleware.js';

export const paymentRouter = Router();

/**
 * @openapi
 * /api/payments/admin:
 *   get:
 *     tags:
 *       - Pagos
 *     summary: Listar todos los pagos
 *     description: Retorna los pagos registrados junto con información del pedido y del cliente. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pagos obtenida correctamente.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 */
paymentRouter.get(
  '/admin',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(listAdminPayments)
);

/**
 * @openapi
 * /api/payments/admin/{id}/status:
 *   patch:
 *     tags:
 *       - Pagos
 *     summary: Actualizar estado de un pago
 *     description: Permite a un administrador actualizar manualmente el estado de un pago.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pago.
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
 *                   - PENDIENTE
 *                   - APROBADO
 *                   - RECHAZADO
 *                   - REEMBOLSADO
 *                 example: APROBADO
 *     responses:
 *       200:
 *         description: Estado del pago actualizado correctamente.
 *       400:
 *         description: Estado o identificador inválido.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *       404:
 *         description: Pago no encontrado.
 */
paymentRouter.patch(
  '/admin/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(updateAdminPaymentStatus)
);

/**
 * @openapi
 * /api/payments/wompi/acceptance:
 *   get:
 *     tags:
 *       - Pagos
 *       - Wompi
 *     summary: Obtener términos de aceptación de Wompi
 *     description: Obtiene los tokens y enlaces vigentes de aceptación y autorización de datos personales requeridos por Wompi.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos de aceptación de Wompi obtenidos correctamente.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene rol CLIENTE.
 */
paymentRouter.get(
  '/wompi/acceptance',
  requireAuth,
  requireRole('CLIENTE'),
  asyncHandler(getWompiAcceptanceData)
);

/**
 * @openapi
 * /api/payments/wompi/pse/institutions:
 *   get:
 *     tags:
 *       - Pagos
 *       - Wompi
 *     summary: Obtener instituciones financieras disponibles para PSE
 *     description: Retorna la lista de instituciones financieras disponibles en Wompi para realizar pagos mediante PSE. Requiere un cliente autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Instituciones financieras de PSE obtenidas correctamente.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene rol CLIENTE.
 */

paymentRouter.get(
  '/wompi/pse/institutions',
  requireAuth,
  requireRole('CLIENTE'),
  asyncHandler(getWompiPseInstitutions)
);

/**
 * @openapi
 * /api/payments/wompi/{transactionId}/status:
 *   get:
 *     tags:
 *       - Pagos
 *       - Wompi
 *     summary: Consultar el estado de una transacción de Wompi
 *     description: Consulta en Wompi el estado actualizado de una transacción asociada a un pedido del cliente autenticado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador de la transacción generado por Wompi.
 *     responses:
 *       200:
 *         description: Estado de la transacción consultado correctamente.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene rol CLIENTE o no puede consultar esta transacción.
 *       404:
 *         description: Pago o transacción no encontrada.
 *       409:
 *         description: La referencia o el monto de Wompi no coincide con el pago registrado.
 */

paymentRouter.get(
  '/wompi/:transactionId/status',
  requireAuth,
  requireRole('CLIENTE'),
  asyncHandler(getWompiPaymentStatus)
);

/**
 * @openapi
 * /api/payments/wompi/webhook:
 *   post:
 *     tags:
 *       - Pagos
 *       - Wompi
 *     summary: Recibir evento webhook de Wompi
 *     description: Recibe eventos enviados por Wompi. La autenticidad se valida mediante la firma SHA-256 del evento y el secreto configurado en el servidor.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event
 *               - data
 *               - signature
 *               - timestamp
 *             properties:
 *               event:
 *                 type: string
 *                 example: transaction.updated
 *               data:
 *                 type: object
 *                 additionalProperties: true
 *               signature:
 *                 type: object
 *                 required:
 *                   - properties
 *                   - checksum
 *                 properties:
 *                   properties:
 *                     type: array
 *                     minItems: 1
 *                     items:
 *                       type: string
 *                   checksum:
 *                     type: string
 *                     pattern: '^[a-fA-F0-9]{64}$'
 *               timestamp:
 *                 type: number
 *     responses:
 *       200:
 *         description: Evento procesado, ignorado o pago no encontrado.
 *       400:
 *         description: Estructura del evento o propiedades de firma inválidas.
 *       401:
 *         description: Firma del evento de Wompi inválida.
 *       409:
 *         description: La referencia o el monto recibido no coincide con el pago registrado.
 */
paymentRouter.post(
  '/wompi/webhook',
  asyncHandler(handleWompiWebhook)
);

/**
 * @openapi
 * /api/payments/wompi:
 *   post:
 *     tags:
 *       - Pagos
 *       - Wompi
 *     summary: Crear una transacción de pago en Wompi
 *     description: Inicia una transacción de Wompi para un pedido perteneciente al cliente autenticado.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - metodo
 *               - acceptanceToken
 *               - acceptPersonalAuth
 *               - paymentMethod
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: id-del-pedido
 *               metodo:
 *                 type: string
 *                 enum:
 *                   - NEQUI
 *                   - DAVIPLATA
 *                   - PSE
 *                   - TRANSFERENCIA_BANCARIA
 *                 example: NEQUI
 *               acceptanceToken:
 *                 type: string
 *                 description: Token vigente de aceptación obtenido desde Wompi.
 *               acceptPersonalAuth:
 *                 type: string
 *                 description: Token vigente de autorización de tratamiento de datos personales.
 *               paymentMethod:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Datos del método de pago requeridos por Wompi.
 *     responses:
 *       201:
 *         description: Transacción de Wompi creada correctamente.
 *       400:
 *         description: Datos de pago inválidos.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene rol CLIENTE.
 *       404:
 *         description: Pedido no encontrado.
 *       409:
 *         description: Pedido cancelado o ya existe un pago pendiente o aprobado.
 */
paymentRouter.post(
  '/wompi',
  requireAuth,
  requireRole('CLIENTE'),
  asyncHandler(createWompiPayment)
);

/**
 * @openapi
 * /api/payments:
 *   post:
 *     tags:
 *       - Pagos
 *     summary: Registrar un pago
 *     description: Registra un pago para un pedido perteneciente al cliente autenticado.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - metodo
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: id-del-pedido
 *               metodo:
 *                 type: string
 *                 enum:
 *                   - NEQUI
 *                   - DAVIPLATA
 *                   - PSE
 *                   - TRANSFERENCIA_BANCARIA
 *                 example: NEQUI
 *     responses:
 *       201:
 *         description: Pago registrado correctamente.
 *       400:
 *         description: Datos del pago inválidos.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene rol CLIENTE.
 *       404:
 *         description: Pedido no encontrado.
 *       409:
 *         description: Pedido cancelado o ya existe un pago pendiente o aprobado.
 */
paymentRouter.post(
  '/',
  requireAuth,
  requireRole('CLIENTE'),
  asyncHandler(createPayment)
);