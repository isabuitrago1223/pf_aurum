import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

interface SendPasswordResetEmailInput {
  to: string;
  nombre: string;
  resetUrl: string;
}

function getTransporter() {
  if (
    !env.SMTP_HOST ||
    !env.SMTP_PORT ||
    !env.SMTP_USER ||
    !env.SMTP_PASS ||
    !env.SMTP_FROM
  ) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE ?? false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
}

export async function sendPasswordResetEmail({
  to,
  nombre,
  resetUrl
}: SendPasswordResetEmailInput) {
  const transporter = getTransporter();

  if (!transporter || !env.SMTP_FROM) {
    if (env.NODE_ENV !== 'production') {
      console.log(`[DEV] Enlace de recuperacion para ${to}: ${resetUrl}`);
      return;
    }

    throw new Error('El servicio de correo no esta configurado.');
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: 'Recuperacion de contrasena - Aurum',
    text: [
      `Hola ${nombre},`,
      '',
      'Recibimos una solicitud para restablecer tu contrasena.',
      `Puedes crear una nueva contrasena ingresando al siguiente enlace: ${resetUrl}`,
      '',
      'Si no solicitaste este cambio, puedes ignorar este mensaje.'
    ].join('\n'),
    html: `
      <p>Hola ${nombre},</p>
      <p>Recibimos una solicitud para restablecer tu contrasena.</p>
      <p>
        <a href="${resetUrl}">Restablecer contrasena</a>
      </p>
      <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
    `
  });
}