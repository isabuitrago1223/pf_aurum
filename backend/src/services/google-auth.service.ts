import { OAuth2Client } from 'google-auth-library';

import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

const googleClient = new OAuth2Client();

export type GoogleProfile = {
  googleId: string;
  email: string;
  nombre: string;
  apellido: string;
};

export async function verifyGoogleIdToken(
  idToken: string
): Promise<GoogleProfile> {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new AppError(
      500,
      'La autenticacion con Google no esta configurada.'
    );
  }

  let ticket;

  try {
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID
    });
  } catch {
    throw new AppError(
      401,
      'La credencial de Google es invalida o ha expirado.'
    );
  }

  const payload = ticket.getPayload();

  if (!payload?.sub) {
    throw new AppError(
      401,
      'La credencial de Google no contiene un identificador valido.'
    );
  }

  if (!payload.email) {
    throw new AppError(
      401,
      'Google no proporciono un correo electronico.'
    );
  }

  if (payload.email_verified !== true) {
    throw new AppError(
      401,
      'El correo de Google no esta verificado.'
    );
  }

  const email = payload.email.trim().toLowerCase();

  const nombre =
    payload.given_name?.trim() ||
    payload.name?.trim() ||
    'Cliente';

  const apellido =
    payload.family_name?.trim() || '';

  return {
    googleId: payload.sub,
    email,
    nombre,
    apellido
  };
}