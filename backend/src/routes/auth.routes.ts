import { Router } from 'express';

import { login, register } from '../controllers/auth.controller.js';
import { asyncHandler } from '../middlewares/async-handler.middleware.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  asyncHandler(register)
);

authRouter.post(
  '/login',
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