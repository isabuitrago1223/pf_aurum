import { Router } from 'express';

import { login, register } from '../controllers/auth.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', register);

authRouter.post('/login', login);

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