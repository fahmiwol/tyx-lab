interface TransferIntent {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELED';
  denom: Denomination;
  amount: number;
  description: string;
  checkoutUrl: string;
  successUrl: string;
  cancelUrl: string;
  expiresAt: ISO8601;
  metadata?: Record<string, unknown>;
}

// Public (from merchant site)
async function createIntent(apiKey: string, {
  amount, denom, description, metadata,
  successUrl, cancelUrl
}): Promise<{ id, checkoutUrl, expiresAt }>;

// Internal (bank server only)
async function confirmIntent(intentId: string, userId: string);
async function cancelIntent(intentId: string);
async function getIntent(intentId: string): Promise<TransferIntent>;