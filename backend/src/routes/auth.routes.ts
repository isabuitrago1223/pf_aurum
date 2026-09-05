import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { login, register } from '../controllers/auth.controller.js';
import { asyncHandler } from '../middlewares/async-handler.middleware.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

export const authRouter = Router();

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Demasiados intentos de inicio de sesion. Intenta nuevamente mas tarde.'
  }
});

authRouter.post(
  '/register',
  asyncHandler(register)
);

authRouter.post(
  '/login',
  loginRateLimit,
  asyncHandler(login)
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