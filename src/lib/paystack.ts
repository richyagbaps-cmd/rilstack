const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export type PaystackChannel = 'card' | 'bank_transfer' | 'ussd';

export interface PaystackApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export function getPaystackSecretKey() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error('Payment service not configured. Add PAYSTACK_SECRET_KEY to environment variables.');
  }

  return secretKey;
}

export async function paystackRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<PaystackApiResponse<T>> {
  const secretKey = getPaystackSecretKey();
  const headers = new Headers(init.headers);

  headers.set('Authorization', `Bearer ${secretKey}`);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  const payload = await response.json();

  if (!response.ok || payload.status === false) {
    throw new Error(payload.message || 'Paystack request failed.');
  }

  return payload as PaystackApiResponse<T>;
}

export function encodeEmailForReference(email: string) {
  return Buffer.from(email.trim().toLowerCase()).toString('base64url');
}

export function buildWithdrawalReference(email: string) {
  return `WTH_${encodeEmailForReference(email)}_${Date.now()}`;
}

export function isReferenceForEmail(reference: string | undefined, email: string) {
  if (!reference) return false;
  return reference.startsWith(`WTH_${encodeEmailForReference(email)}_`);
}

export function mapDepositMethodToChannel(method: 'card' | 'transfer' | 'ussd'): PaystackChannel {
  if (method === 'transfer') return 'bank_transfer';
  if (method === 'ussd') return 'ussd';
  return 'card';
}

export function mapPaystackChannelToMethod(channel?: string): 'card' | 'transfer' | 'ussd' {
  if (channel === 'bank_transfer' || channel === 'bank') return 'transfer';
  if (channel === 'ussd') return 'ussd';
  return 'card';
}
