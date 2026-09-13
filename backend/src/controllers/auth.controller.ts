import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';
import { signAccessToken } from '../utils/jwt.js';
import { sendPasswordResetEmail } from '../services/mail.service.js';

const password = z
  .string()
  .min(8)
  .regex(/[A-Z]/)
  .regex(/[a-z]/)
  .regex(/[0-9]/)
  .regex(/[^A-Za-z0-9]/);

const registerSchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  apellido: z.string().trim().min(2).max(80),
  cedula: z.string().trim().regex(/^\d{6,15}$/),
  telefono: z.string().trim().regex(/^\+?[0-9\s-]{7,20}$/),
  direccion: z.string().trim().min(5).max(160),
  barrio: z.string().trim().min(2).max(80),
  ciudad: z.string().trim().min(2).max(80),
  departamento: z.string().trim().min(2).max(80),
  fechaNacimiento: z.coerce.date(),
  email: z.string().trim().email().max(120),
  password,
  acceptedTerms: z.literal(true),
  acceptedPrivacy: z.literal(true),
  acceptedDataPolicy: z.literal(true)
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(120)
});

const resetPasswordSchema = z.object({
  token: z.string().trim().min(1),
  password
});

const forgotPasswordResponse = {
  message:
    'Si el correo esta registrado, recibiras instrucciones para restablecer tu contrasena.'
};

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);

  const exists = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { cedula: data.cedula }]
    }
  });

  if (exists) {
    throw new AppError(
      409,
      'El correo o la cedula ya estan registrados.'
    );
  }

  const {
    password: rawPassword,
    acceptedTerms: _terms,
    acceptedPrivacy: _privacy,
    acceptedDataPolicy: _dataPolicy,
    ...userData
  } = data;

  const user = await prisma.user.create({
    data: {
      ...userData,
      passwordHash: await bcrypt.hash(rawPassword, 12),
      role: 'CLIENTE'
    }
  });

  const token = signAccessToken({
    sub: user.id,
    role: user.role
  });

  res.status(201).json({
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      role: user.role
    }
  });
}

export async function login(req: Request, res: Response) {
  const {
    email,
    password: rawPassword
  } = z
    .object({
      email: z.string().email(),
      password: z.string().min(1)
    })
    .parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (
    !user ||
    !user.passwordHash ||
    !(await bcrypt.compare(rawPassword, user.passwordHash))
  ) {
    throw new AppError(
      401,
      'Correo o contrasena incorrectos.'
    );
  }

  const token = signAccessToken({
    sub: user.id,
    role: user.role
  });

  res.json({
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      role: user.role
    }
  });
}

export async function forgotPassword(
  req: Request,
  res: Response
) {
  const { email } = forgotPasswordSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email }
  });

  /*
   * Siempre devolvemos la misma respuesta.
   * Esto evita revelar si un correo esta registrado.
   */
  if (!user || !user.passwordHash) {
    res.json(forgotPasswordResponse);
    return;
  }

  const rawToken = randomBytes(32).toString('hex');

  const tokenHash = createHash('sha256')
    .update(rawToken)
    .digest('hex');

  const expiresAt = new Date(
    Date.now() + 30 * 60 * 1000
  );

  /*
   * Invalidamos tokens anteriores sin utilizar
   * para que solamente el enlace mas reciente sea valido.
   */
  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      usedAt: null
    },
    data: {
      usedAt: new Date()
    }
  });

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt
    }
  });

  const resetUrl =
    `${env.FRONTEND_URL}/restablecer-contrasena` +
    `?token=${encodeURIComponent(rawToken)}`;

  await sendPasswordResetEmail({
    to: user.email,
    nombre: user.nombre,
    resetUrl
  });

  res.json(forgotPasswordResponse);
}

export async function resetPassword(
  req: Request,
  res: Response
) {
  const {
    token: rawToken,
    password: newPassword
  } = resetPasswordSchema.parse(req.body);

  const tokenHash = createHash('sha256')
    .update(rawToken)
    .digest('hex');

  const resetToken =
    await prisma.passwordResetToken.findUnique({
      where: {
        tokenHash
      }
    });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt <= new Date()
  ) {
    throw new AppError(
      400,
      'El enlace de recuperacion es invalido o ha expirado.'
    );
  }

  const passwordHash = await bcrypt.hash(
    newPassword,
    12
  );

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: resetToken.userId
      },
      data: {
        passwordHash
      }
    });

    /*
     * Al cambiar la contrasena invalidamos todos los
     * tokens pendientes de recuperacion de este usuario.
     */
    await tx.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        usedAt: null
      },
      data: {
        usedAt: new Date()
      }
    });
  });

  res.json({
    message: 'Contrasena restablecida correctamente.'
  });
}