import { createHash } from 'node:crypto';

import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

const WOMPI_BASE_URL =
  env.WOMPI_ENVIRONMENT === 'production'
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1';

export type WompiTransactionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED'
  | 'VOIDED'
  | 'ERROR';

export function createWompiIntegritySignature(
  reference: string,
  amountInCents: number,
  currency = 'COP'
) {
  const data =
    reference +
    amountInCents.toString() +
    currency +
    env.WOMPI_INTEGRITY_SECRET;

  return createHash('sha256').update(data).digest('hex');
}

export async function wompiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${WOMPI_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${env.WOMPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AppError(
      502,
      `Wompi rechazo la solicitud con estado ${response.status}.`
    );
  }

  return body as T;
}

export interface CreateWompiTransactionInput {
  acceptanceToken: string;
  acceptPersonalAuth: string;
  reference: string;
  amountInCents: number;
  customerEmail: string;
  paymentMethod: Record<string, unknown>;
}

export interface WompiTransaction {
  id: string;
  reference: string;
  status: WompiTransactionStatus;
  amount_in_cents: number;
  currency: string;
}

interface WompiTransactionResponse {
  data: WompiTransaction;
}

export async function createWompiTransaction(
  input: CreateWompiTransactionInput
) {
  const signature = createWompiIntegritySignature(
    input.reference,
    input.amountInCents
  );

  return wompiRequest<WompiTransactionResponse>('/transactions', {
    method: 'POST',
    body: JSON.stringify({
      acceptance_token: input.acceptanceToken,
      accept_personal_auth: input.acceptPersonalAuth,
      amount_in_cents: input.amountInCents,
      currency: 'COP',
      customer_email: input.customerEmail,
      payment_method: input.paymentMethod,
      reference: input.reference,
      signature
    })
  });
}

export async function getWompiTransaction(transactionId: string) {
  return wompiRequest<WompiTransactionResponse>(
    `/transactions/${encodeURIComponent(transactionId)}`,
    {
      method: 'GET'
    }
  );
}
