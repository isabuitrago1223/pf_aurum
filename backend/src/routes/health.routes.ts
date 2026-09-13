import { Router } from 'express';

import { healthCheck } from '../controllers/health.controller.js';

export const healthRouter = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Verificar estado de la API
 *     description: Comprueba que el servicio de Aurum se encuentra activo.
 *     responses:
 *       200:
 *         description: API funcionando correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: Aurum Decoraciones API
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
healthRouter.get('/', healthCheck);