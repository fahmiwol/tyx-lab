/**
 * Phone number normalization for Southeast Asia.
 *
 * Why: WhatsApp and regional gateways require canonical phone formats (no +, no spaces,
 * country code prefix). This atomic pattern handles Indonesia (62) and general cases.
 *
 * Usage:
 *   const phone = canonicalPhone("0812-3456-7890");  // "628123456789"
 *   const phone = canonicalPhone("+62 812 3456 789"); // "628123456789"
 */

export interface PhoneFormatOptions {
  countryCode?: string;  // Default "62" (Indonesia)
  addPlus?: boolean;     // Return "+62..." format
}

export function canonicalPhone(raw: string, opts?: PhoneFormatOptions): string {
  const countryCode = opts?.countryCode ?? "62";
  const addPlus = opts?.addPlus ?? false;

  // Strip all non-digits
  let digits = raw.replace(/\D/g, "");

  // Handle leading 0 (Indonesia: 0812 → 62812)
  if (digits.startsWith("0")) {
    digits = countryCode + digits.slice(1);
  }

  // Add country code if not present
  if (!digits.startsWith(countryCode)) {
    digits = countryCode + digits;
  }

  return addPlus ? `+${digits}` : digits;
}

export function formatPhone(
  digits: string,
  pattern: "whatsapp" | "display" | "raw" = "whatsapp",
): string {
  const canonical = canonicalPhone(digits);

  switch (pattern) {
    case "whatsapp":
      return canonical;  // 628123456789
    case "display":
      return `+${canonical}`;  // +628123456789
    case "raw":
      return digits;
    default:
      return canonical;
  }
}

export function isValidPhone(digits: string): boolean {
  const canonical = canonicalPhone(digits);
  // Indonesian numbers: 62 + 9-11 more digits
  return /^62\d{9,11}$/.test(canonical);
}
