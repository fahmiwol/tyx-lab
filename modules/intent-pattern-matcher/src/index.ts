/**
 * Rule-based intent pattern matcher for business domain language.
 *
 * Why: Small merchants and SMEs use shorthand/dialects (e.g., "cek stok" = check stock).
 * Static rule engine classifies intent before expensive LLM inference, cutting costs.
 *
 * Usage:
 *   const engine = new RuleEngine();
 *   const intent = engine.match("cek stok 5kg");  // { intent: "cek_stok", confidence: 0.95 }
 */

export type Intent = "cek_stok" | "produksi" | "penjualan" | "unknown";

export interface ParsedIntent {
  intent: Intent;
  confidence: number;  // 0-1
  source: "rule" | "ai";
  slots: Record<string, number | string>;
}

export class IntentPatternMatcher {
  /**
   * Try to match text against domain patterns.
   * Returns null if no match. Prefer rules to avoid LLM calls.
   */
  match(text: string): ParsedIntent | null {
    const normalized = text.trim().toLowerCase();

    // Pattern 1: Stock check — "cek stok", "berapa stok", "lihat stock 5kg"
    if (/(cek|lihat|berapa).*(stok|stock)/i.test(normalized)) {
      const qty = this.extractQuantity(normalized);
      return {
        intent: "cek_stok",
        confidence: 0.95,
        source: "rule",
        slots: qty ? { qty } : {},
      };
    }

    // Pattern 2: Production log — "catat produksi 50kg", "hasil produksi 10kg"
    if (/(catat|tambah|input|log).*(produksi)|^produksi|hasil produksi/i.test(normalized)) {
      const qty = this.extractQuantity(normalized);
      if (qty) {
        return {
          intent: "produksi",
          confidence: 0.9,
          source: "rule",
          slots: { qty },
        };
      }
    }

    // Pattern 3: Sale — "penjualan 70kg harga 15000", "jual 10kg 20rb"
    const sale = this.parseSale(normalized);
    if (sale) {
      return {
        intent: "penjualan",
        confidence: 0.92,
        source: "rule",
        slots: sale,
      };
    }

    return null;
  }

  private extractQuantity(text: string): number | null {
    const m = text.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
    if (!m) return null;
    return parseFloat(m[1].replace(",", "."));
  }

  private parseSale(text: string): Record<string, number> | null {
    const kg = text.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
    if (!kg) return null;
    const qty = parseFloat(kg[1].replace(",", "."));

    let price: number | undefined;
    const rp = text.match(/harga\s*Rp?\s*(\d[\d.]*)|harga\s*(\d[\d.]*)/i);
    const ribu = text.match(/(\d+(?:[.,]\d+)?)\s*(rb|ribu)\b/i);
    const plain = text.match(/(?:harga|,)\s*(\d{2,})(?!\s*kg)|\s(\d{4,})(?=\s*$|\s*[^kg])/i);

    if (rp) {
      const raw = (rp[1] ?? rp[2] ?? "").replace(/\./g, "");
      price = parseInt(raw, 10);
    } else if (ribu) {
      price = Math.round(parseFloat(ribu[1].replace(",", ".")) * 1000);
    } else if (plain) {
      const candidate = plain[1] ?? plain[2];
      price = parseInt(String(candidate).replace(/\./g, ""), 10);
    }

    if (price == null || Number.isNaN(price)) {
      return { qty };
    }
    return { qty, price };
  }
}
