import getDb from '@/lib/db';

/**
 * Currency formatter & conversion for IDR ↔ USD.
 * Rate stored in site_settings or env. Payments always in IDR.
 * USD is display-only for international customers.
 */

const DEFAULT_RATE = 16_000; // 1 USD = Rp 16.000

/**
 * Get current USD→IDR rate from DB or fallback.
 */
export function getUsdRate(): number {
  try {
    const row = getDb()
      .prepare("SELECT value FROM site_settings WHERE key = 'usd_rate'")
      .get() as { value: string } | undefined;

    const n = row ? parseInt(row.value, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_RATE;
  } catch {
    return DEFAULT_RATE;
  }
}

/**
 * Convert IDR to USD (float, 2 decimals).
 * Example: idrToUsd(160000, 16000) → "10.00"
 */
export function idrToUsd(idr: number, rate: number): string {
  return (idr / rate).toFixed(2);
}

/**
 * Format as USD display: "$X.XX"
 */
export function usdDisplayPrice(idr: number, rate: number): string {
  return `$${idrToUsd(idr, rate)}`;
}

/**
 * Format as IDR display: "Rp 150.000"
 */
export function idrDisplayPrice(idr: number): string {
  return 'Rp ' + idr.toLocaleString('id-ID');
}

/**
 * Full label: "Rp 150.000 (~$10.00)"
 */
export function fullPriceLabel(idr: number, rate: number): string {
  return `${idrDisplayPrice(idr)} (~${usdDisplayPrice(idr, rate)})`;
}

/**
 * Update rate in DB. Admin only.
 */
export function setUsdRate(newRate: number): boolean {
  if (!Number.isFinite(newRate) || newRate <= 0) return false;

  try {
    getDb()
      .prepare(
        `INSERT INTO site_settings (key, value) VALUES ('usd_rate', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`
      )
      .run(String(newRate));
    return true;
  } catch {
    return false;
  }
}

export { DEFAULT_RATE };
