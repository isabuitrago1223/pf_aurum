import { Router } from 'express';

import { login, register } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', register);

authRouter.post('/login', login);

authRouter.get('/profile', requireAuth, (req, res) => {
  res.json({
    message: 'Ruta protegida accesible.'
  });
});