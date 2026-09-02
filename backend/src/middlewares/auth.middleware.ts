import type { NextFunction, Request, Response } from 'express';

import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    role: 'CLIENTE' | 'ADMIN';
  };
}

export function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return next(new AppError(401, 'Autenticacion requerida.'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      role: 'CLIENTE' | 'ADMIN';
    };

    req.auth = {
      userId: payload.sub,
      role: payload.role
    };

    next();
  } catch {
    return next(
      new AppError(401, 'Sesion invalida o expirada.')
    );
  }
}

export function requireRole(...roles: Array<'CLIENTE' | 'ADMIN'>) {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return next(
        new AppError(403, 'No tienes permisos para esta accion.')
      );
    }

    next();
  };
}