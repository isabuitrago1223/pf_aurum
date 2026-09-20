import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import {
  forgotPassword,
  googleLogin,
  login,
  register,
  resetPassword
} from '../controllers/auth.controller.js';
import { asyncHandler } from '../middlewares/async-handler.middleware.js';
import {
  requireAuth,
  requireRole
} from '../middlewares/auth.middleware.js';

export const authRouter = Router();

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message:
      'Demasiados intentos de inicio de sesion. Intenta nuevamente mas tarde.'
  }
});

const passwordRecoveryRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message:
      'Demasiados intentos de recuperacion. Intenta nuevamente mas tarde.'
  }
});

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Autenticacion
 *     summary: Registrar un nuevo cliente
 *     description: Crea una cuenta nueva con rol CLIENTE y devuelve un token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - cedula
 *               - telefono
 *               - direccion
 *               - barrio
 *               - ciudad
 *               - departamento
 *               - fechaNacimiento
 *               - email
 *               - password
 *               - acceptedTerms
 *               - acceptedPrivacy
 *               - acceptedDataPolicy
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Tatiana
 *               apellido:
 *                 type: string
 *                 example: Buitrago
 *               cedula:
 *                 type: string
 *                 example: "1234567890"
 *               telefono:
 *                 type: string
 *                 example: "3193814755"
 *               direccion:
 *                 type: string
 *                 example: Calle 50 # 40-20
 *               barrio:
 *                 type: string
 *                 example: Niquia
 *               ciudad:
 *                 type: string
 *                 example: Bello
 *               departamento:
 *                 type: string
 *                 example: Antioquia
 *               fechaNacimiento:
 *                 type: string
 *                 format: date
 *                 example: "2000-01-15"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: cliente@aurum.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Aurum123*
 *               acceptedTerms:
 *                 type: boolean
 *                 example: true
 *               acceptedPrivacy:
 *                 type: boolean
 *                 example: true
 *               acceptedDataPolicy:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Datos de registro invalidos
 *       409:
 *         description: El correo o la cedula ya estan registrados
 */

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Autenticacion
 *     summary: Iniciar sesion
 *     description: Valida correo y contrasena y devuelve un token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: cliente@aurum.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Aurum123*
 *     responses:
 *       200:
 *         description: Inicio de sesion correcto
 *       400:
 *         description: Datos de inicio de sesion invalidos
 *       401:
 *         description: Correo o contrasena incorrectos
 *       403:
 *         description: La cuenta se encuentra suspendida
 *       429:
 *         description: Demasiados intentos de inicio de sesion
 */

/**
 * @openapi
 * /api/auth/google:
 *   post:
 *     tags:
 *       - Autenticacion
 *     summary: Iniciar sesion o registrarse con Google
 *     description: Valida una credencial de Google. Si el cliente ya existe, inicia sesion. Si no existe, crea una cuenta CLIENTE siempre que acepte los consentimientos requeridos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credential
 *             properties:
 *               credential:
 *                 type: string
 *                 description: ID token emitido por Google.
 *                 example: credencial_google_id_token
 *               acceptedTerms:
 *                 type: boolean
 *                 description: Requerido para crear una cuenta nueva con Google.
 *                 example: true
 *               acceptedPrivacy:
 *                 type: boolean
 *                 description: Requerido para crear una cuenta nueva con Google.
 *                 example: true
 *               acceptedDataPolicy:
 *                 type: boolean
 *                 description: Requerido para crear una cuenta nueva con Google.
 *                 example: true
 *     responses:
 *       200:
 *         description: Autenticacion con Google correcta
 *       400:
 *         description: Credencial o datos invalidos, o faltan consentimientos para crear la cuenta
 *       403:
 *         description: Cuenta suspendida o acceso con Google no permitido para el rol del usuario
 *       409:
 *         description: El correo ya esta vinculado a otra cuenta de Google
 *       429:
 *         description: Demasiados intentos de inicio de sesion
 */

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Autenticacion
 *     summary: Solicitar recuperacion de contrasena
 *     description: Genera un enlace temporal de recuperacion si el correo corresponde a una cuenta valida.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: cliente@aurum.com
 *     responses:
 *       200:
 *         description: Solicitud procesada
 *       400:
 *         description: Correo invalido
 *       429:
 *         description: Demasiados intentos de recuperacion
 */

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Autenticacion
 *     summary: Restablecer contrasena
 *     description: Cambia la contrasena usando un token temporal valido.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 example: token_recibido_por_correo
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NuevaClave123*
 *     responses:
 *       200:
 *         description: Contrasena restablecida correctamente
 *       400:
 *         description: Token invalido, expirado o nueva contrasena invalida
 *       429:
 *         description: Demasiados intentos de recuperacion
 */

/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     tags:
 *       - Autenticacion
 *     summary: Probar una ruta protegida
 *     description: Requiere un token JWT valido.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ruta protegida accesible
 *       401:
 *         description: Autenticacion requerida, sesion invalida o expirada
 *       403:
 *         description: La cuenta se encuentra suspendida
 */

/**
 * @openapi
 * /api/auth/admin:
 *   get:
 *     tags:
 *       - Autenticacion
 *     summary: Probar acceso exclusivo de administrador
 *     description: Requiere un token JWT valido con rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ruta exclusiva para administradores
 *       401:
 *         description: Autenticacion requerida, sesion invalida o expirada
 *       403:
 *         description: Cuenta suspendida o usuario sin permisos de administrador
 */

authRouter.post(
  '/register',
  asyncHandler(register)
);

authRouter.post(
  '/login',
  loginRateLimit,
  asyncHandler(login)
);

authRouter.post(
  '/google',
  loginRateLimit,
  asyncHandler(googleLogin)
);

authRouter.post(
  '/forgot-password',
  passwordRecoveryRateLimit,
  asyncHandler(forgotPassword)
);

authRouter.post(
  '/reset-password',
  passwordRecoveryRateLimit,
  asyncHandler(resetPassword)
);

authRouter.get('/profile', requireAuth, (req, res) => {
  res.json({
    message: 'Ruta protegida accesible.'
  });
});

authRouter.get(
  '/admin',
  requireAuth,
  requireRole('ADMIN'),
  (_req, res) => {
    res.json({
      message: 'Ruta exclusiva para administradores.'
    });
  }
);