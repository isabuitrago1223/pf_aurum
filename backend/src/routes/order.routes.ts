import { Router } from 'express';

import {
  createOrder,
  getMyOrderById,
  getMyOrderReceipt,
  listAllOrders,
  listMyOrders,
  updateOrderStatus
} from '../controllers/order.controller.js';

import { asyncHandler } from '../middlewares/async-handler.middleware.js';

import {
  requireAuth,
  requireRole
} from '../middlewares/auth.middleware.js';

export const orderRouter = Router();

/**
 * @openapi
 * /api/orders/my-orders:
 *   get:
 *     tags:
 *       - Pedidos
 *     summary: Obtener mis pedidos
 *     description: Retorna los pedidos pertenecientes al cliente autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos obtenida correctamente.
 *       401:
 *         description: Autenticacion requerida o sesion invalida.
 *       403:
 *         description: El usuario no tiene rol CLIENTE.
 */
orderRouter.get(
  '/my-orders',
  requireAuth,
  requireRole('CLIENTE'),
  asyncHandler(listMyOrders)
);

/**
 * @openapi
 * /api/orders/admin:
 *   get:
 *     tags:
 *       - Pedidos
 *     summary: Obtener todos los pedidos
 *     description: Retorna todos los pedidos registrados junto con informacion basica del cliente. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de pedidos obtenida correctamente.
 *       401:
 *         description: Autenticacion requerida o sesion invalida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 */
orderRouter.get(
  '/admin',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(listAllOrders)
);

/**
 * @openapi
 * /api/orders/admin/{id}/status:
 *   patch:
 *     tags:
 *       - Pedidos
 *     summary: Actualizar estado de un pedido
 *     description: Cambia el estado de un pedido segun las transiciones permitidas. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido.
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
 *                   - EN_PREPARACION
 *                   - EN_CAMINO
 *                   - ENTREGADO
 *                   - CANCELADO
 *                 example: EN_PREPARACION
 *               motivoCancelacion:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *                 example: El cliente solicito cancelar el pedido.
 *     responses:
 *       200:
 *         description: Estado del pedido actualizado correctamente.
 *       400:
 *         description: Datos del estado invalidos o falta motivo de cancelacion.
 *       401:
 *         description: Autenticacion requerida o sesion invalida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *       404:
 *         description: Pedido no encontrado.
 *       409:
 *         description: Transicion de estado no permitida o pedido ya cancelado.
 */
orderRouter.patch(
  '/admin/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(updateOrderStatus)
);

/**
 * @openapi
 * /api/orders/{id}/receipt:
 *   get:
 *     tags:
 *       - Pedidos
 *     summary: Descargar comprobante de compra
 *     description: Genera y descarga un comprobante PDF del pedido si pertenece al cliente autenticado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido.
 *     responses:
 *       200:
 *         description: Comprobante PDF generado correctamente.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Autenticacion requerida o sesion invalida.
 *       403:
 *         description: El usuario no tiene rol CLIENTE.
 *       404:
 *         description: Pedido no encontrado.
 */
orderRouter.get(
  '/:id/receipt',
  requireAuth,
  requireRole('CLIENTE'),
  asyncHandler(getMyOrderReceipt)
);

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     tags:
 *       - Pedidos
 *     summary: Obtener uno de mis pedidos
 *     description: Retorna el detalle de un pedido si pertenece al cliente autenticado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido.
 *     responses:
 *       200:
 *         description: Pedido obtenido correctamente.
 *       401:
 *         description: Autenticacion requerida o sesion invalida.
 *       403:
 *         description: El usuario no tiene rol CLIENTE.
 *       404:
 *         description: Pedido no encontrado.
 */
orderRouter.get(
  '/:id',
  requireAuth,
  requireRole('CLIENTE'),
  asyncHandler(getMyOrderById)
);

/**
 * @openapi
 * /api/orders:
 *   post:
 *     tags:
 *       - Pedidos
 *     summary: Crear un pedido
 *     description: Crea un pedido para el cliente autenticado, valida stock y descuenta las unidades solicitadas.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - metodoEntrega
 *               - nombreContacto
 *               - emailContacto
 *               - telefonoContacto
 *               - items
 *             properties:
 *               metodoEntrega:
 *                 type: string
 *                 enum:
 *                   - DOMICILIO
 *                   - TIENDA
 *                 example: DOMICILIO
 *               nombreContacto:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 160
 *                 example: Cliente Prueba
 *               cedulaContacto:
 *                 type: string
 *                 maxLength: 15
 *                 example: "1234567890"
 *               emailContacto:
 *                 type: string
 *                 format: email
 *                 maxLength: 120
 *                 example: cliente.prueba.aurum@example.com
 *               telefonoContacto:
 *                 type: string
 *                 minLength: 7
 *                 maxLength: 20
 *                 example: "3001234567"
 *               direccionEntrega:
 *                 type: string
 *                 maxLength: 160
 *                 example: Calle 10 # 20-30
 *               barrioEntrega:
 *                 type: string
 *                 maxLength: 80
 *                 example: Niquia
 *               ciudadEntrega:
 *                 type: string
 *                 maxLength: 80
 *                 example: Bello
 *               departamentoEntrega:
 *                 type: string
 *                 maxLength: 80
 *                 example: Antioquia
 *               notasEntrega:
 *                 type: string
 *                 maxLength: 500
 *                 example: Entregar en recepcion.
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - cantidad
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: cmtrivxis000vwbbkrxw6rqtn
 *                     cantidad:
 *                       type: integer
 *                       minimum: 1
 *                       example: 1
 *                     personalizacion:
 *                       nullable: true
 *                       description: Datos opcionales de personalizacion del producto.
 *     responses:
 *       201:
 *         description: Pedido creado correctamente.
 *       400:
 *         description: Datos invalidos o direccion incompleta para entrega a domicilio.
 *       401:
 *         description: Autenticacion requerida o sesion invalida.
 *       403:
 *         description: El usuario no tiene rol CLIENTE.
 *       404:
 *         description: Uno o mas productos no existen o no estan disponibles.
 *       409:
 *         description: Stock insuficiente o el stock cambio durante la operacion.
 */
orderRouter.post(
  '/',
  requireAuth,
  requireRole('CLIENTE'),
  asyncHandler(createOrder)
);