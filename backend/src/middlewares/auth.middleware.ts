import type { NextFunction, Request, Response } from 'express';

import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    role: 'CLIENTE' | 'ADMIN';
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return next(new AppError(401, 'Autenticacion requerida.'));
  }

  let payload: {
    sub: string;
    role: 'CLIENTE' | 'ADMIN';
  };

  try {
    payload = jwt.verify(token, env.JWT_SECRET) as typeof payload;
  } catch {
    return next(
      new AppError(401, 'Sesion invalida o expirada.')
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        role: true,
        estado: true
      }
    });

    if (!user) {
      return next(
        new AppError(401, 'Sesion invalida o expirada.')
      );
    }

    if (user.estado === 'SUSPENDIDO') {
      return next(
        new AppError(403, 'La cuenta se encuentra suspendida.')
      );
    }

    req.auth = {
      userId: user.id,
      role: user.role
    };

    return next();
  } catch (error) {
    return next(error);
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

    return next();
  };
}
