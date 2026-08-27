import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { signAccessToken } from '../utils/jwt.js';

const password = z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/);
const registerSchema = z.object({
  nombre: z.string().trim().min(2).max(80), apellido: z.string().trim().min(2).max(80),
  cedula: z.string().trim().regex(/^\d{6,15}$/), telefono: z.string().trim().regex(/^\+?[0-9\s-]{7,20}$/),
  direccion: z.string().trim().min(5).max(160), barrio: z.string().trim().min(2).max(80),
  ciudad: z.string().trim().min(2).max(80), departamento: z.string().trim().min(2).max(80),
  fechaNacimiento: z.coerce.date(), email: z.string().trim().email().max(120), password,
  acceptedTerms: z.literal(true), acceptedPrivacy: z.literal(true), acceptedDataPolicy: z.literal(true)
});

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  const exists = await prisma.user.findFirst({ where: { OR: [{ email: data.email }, { cedula: data.cedula }] } });
  if (exists) throw new AppError(409, 'El correo o la cedula ya estan registrados.');
  const { password: rawPassword, acceptedTerms: _terms, acceptedPrivacy: _privacy, acceptedDataPolicy: _dataPolicy, ...userData } = data;
  const user = await prisma.user.create({ data: { ...userData, passwordHash: await bcrypt.hash(rawPassword, 12), role: 'CLIENTE' } });
  const token = signAccessToken({ sub: user.id, role: user.role });
  res.status(201).json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role } });
}

export async function login(req: Request, res: Response) {
  const { email, password: rawPassword } = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash || !(await bcrypt.compare(rawPassword, user.passwordHash))) {
    throw new AppError(401, 'Correo o contrasena incorrectos.');
  }
  const token = signAccessToken({ sub: user.id, role: user.role });
  res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role } });
}