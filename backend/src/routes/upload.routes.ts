import { Router } from 'express';

import { uploadImage } from '../controllers/upload.controller.js';
import { asyncHandler } from '../middlewares/async-handler.middleware.js';
import {
  requireAuth,
  requireRole
} from '../middlewares/auth.middleware.js';
import { uploadImage as uploadImageMiddleware } from '../middlewares/upload.middleware.js';

export const uploadRouter = Router();

/**
 * @openapi
 * /api/uploads:
 *   post:
 *     tags:
 *       - Uploads
 *     summary: Subir una imagen
 *     description: Sube una imagen a Cloudinary dentro de la carpeta aurum. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagen a subir. Tamaño máximo permitido 5 MB.
 *     responses:
 *       201:
 *         description: Imagen subida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 image:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: https://res.cloudinary.com/ejemplo/image/upload/aurum/imagen.jpg
 *                     publicId:
 *                       type: string
 *                       example: aurum/imagen
 *       400:
 *         description: No se envió una imagen, el archivo no es una imagen o supera el tamaño permitido.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 */
uploadRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  uploadImageMiddleware.single('image'),
  asyncHandler(uploadImage)
);