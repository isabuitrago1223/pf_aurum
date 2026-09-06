import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../utils/app-error.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Datos de entrada invalidos.',
      errors: err.issues
    });

    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message
    });

    return;
  }

  console.error(err);

  res.status(500).json({
    message: 'Error interno del servidor.'
  });
};