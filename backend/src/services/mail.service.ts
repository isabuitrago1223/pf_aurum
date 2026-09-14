import nodemailer from 'nodemailer';

import { env } from '../config/env.js';

interface SendPasswordResetEmailInput {
  to: string;
  nombre: string;
  resetUrl: string;
}

interface OrderEmailItem {
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number | string;
}

interface SendOrderConfirmationEmailInput {
  to: string;
  nombre: string;
  numeroPedido: string;
  metodoEntrega: 'DOMICILIO' | 'TIENDA';
  direccionEntrega?: string | null;
  barrioEntrega?: string | null;
  ciudadEntrega?: string | null;
  departamentoEntrega?: string | null;
  subtotal: number | string;
  costoEnvio: number | string;
  descuento: number | string;
  total: number | string;
  items: OrderEmailItem[];
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

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(Number(value));
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
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
      <p>Hola ${escapeHtml(nombre)},</p>
      <p>Recibimos una solicitud para restablecer tu contrasena.</p>
      <p>
        <a href="${escapeHtml(resetUrl)}">Restablecer contrasena</a>
      </p>
      <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
    `
  });
}

export async function sendOrderConfirmationEmail({
  to,
  nombre,
  numeroPedido,
  metodoEntrega,
  direccionEntrega,
  barrioEntrega,
  ciudadEntrega,
  departamentoEntrega,
  subtotal,
  costoEnvio,
  descuento,
  total,
  items
}: SendOrderConfirmationEmailInput) {
  const transporter = getTransporter();

  if (!transporter || !env.SMTP_FROM) {
    if (env.NODE_ENV !== 'production') {
      console.log(
        `[DEV] Confirmacion de pedido ${numeroPedido} preparada para ${to}.`
      );
      return;
    }

    throw new Error('El servicio de correo no esta configurado.');
  }

  const itemsText = items.map((item) => (
    `- ${item.nombreProducto} x${item.cantidad}: ${formatCurrency(
      Number(item.precioUnitario) * item.cantidad
    )}`
  ));

  const itemsHtml = items.map((item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">
        ${escapeHtml(item.nombreProducto)}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">
        ${item.cantidad}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">
        ${formatCurrency(Number(item.precioUnitario) * item.cantidad)}
      </td>
    </tr>
  `).join('');

  const direccionText =
    metodoEntrega === 'DOMICILIO'
      ? [
          direccionEntrega,
          barrioEntrega,
          ciudadEntrega,
          departamentoEntrega
        ]
          .filter(Boolean)
          .join(', ')
      : 'Recogida en tienda';

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: `Confirmacion de pedido ${numeroPedido} - Aurum`,
    text: [
      `Hola ${nombre},`,
      '',
      'Hemos recibido tu pedido correctamente.',
      `Numero de pedido: ${numeroPedido}`,
      `Metodo de entrega: ${
        metodoEntrega === 'DOMICILIO' ? 'Domicilio' : 'Recogida en tienda'
      }`,
      `Entrega: ${direccionText}`,
      '',
      'Productos:',
      ...itemsText,
      '',
      `Subtotal: ${formatCurrency(subtotal)}`,
      `Costo de envio: ${formatCurrency(costoEnvio)}`,
      `Descuento: ${formatCurrency(descuento)}`,
      `Total: ${formatCurrency(total)}`,
      '',
      'Gracias por comprar en Aurum.'
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: auto;">
        <h2>Gracias por tu pedido, ${escapeHtml(nombre)}</h2>

        <p>Hemos recibido tu pedido correctamente.</p>

        <p>
          <strong>Numero de pedido:</strong>
          ${escapeHtml(numeroPedido)}
        </p>

        <p>
          <strong>Metodo de entrega:</strong>
          ${
            metodoEntrega === 'DOMICILIO'
              ? 'Domicilio'
              : 'Recogida en tienda'
          }
        </p>

        <p>
          <strong>Entrega:</strong>
          ${escapeHtml(direccionText)}
        </p>

        <table
          style="width: 100%; border-collapse: collapse; margin-top: 20px;"
        >
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px;">Producto</th>
              <th style="text-align: left; padding: 8px;">Cantidad</th>
              <th style="text-align: left; padding: 8px;">Valor</th>
            </tr>
          </thead>

          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 20px;">
          <p><strong>Subtotal:</strong> ${formatCurrency(subtotal)}</p>
          <p><strong>Costo de envio:</strong> ${formatCurrency(costoEnvio)}</p>
          <p><strong>Descuento:</strong> ${formatCurrency(descuento)}</p>
          <p><strong>Total:</strong> ${formatCurrency(total)}</p>
        </div>

        <p style="margin-top: 24px;">
          Gracias por comprar en Aurum.
        </p>
      </div>
    `
  });
}