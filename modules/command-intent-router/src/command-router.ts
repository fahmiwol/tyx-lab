export type MatchType = "exact" | "regex" | "fuzzy";

export interface CommandPattern {
  intent: string;
  pattern: string | RegExp;
  type: MatchType;
  priority: number;
  paramNames?: string[];
  minConfidence?: number; // For fuzzy; default 0.8
}

export interface ParseResult {
  intent: string;
  confidence: number; // 0..1
  params: Record<string, string>;
  matched: boolean;
}

/**
 * Command intent router: Parse text → extract intent + params.
 */
export class CommandIntentRouter {
  private patterns: CommandPattern[];
  private exactMap: Map<string, CommandPattern> = new Map();

  constructor(patterns: CommandPattern[]) {
    this.patterns = patterns.sort((a, b) => b.priority - a.priority);
    // Pre-index exact patterns for O(1) lookup
    this.patterns.forEach((p) => {
      if (p.type === "exact" && typeof p.pattern === "string") {
        this.exactMap.set(p.pattern.toLowerCase(), p);
      }
    });
  }

  /**
   * Parse input text and return best matching intent.
   */
  parse(text: string): ParseResult | null {
    const input = text.trim();

    // 1. Try exact match
    const exact = this.exactMap.get(input.toLowerCase());
    if (exact) {
      return {
        intent: exact.intent,
        confidence: 1.0,
        params: {},
        matched: true,
      };
    }

    // 2. Try regex patterns
    for (const pattern of this.patterns.filter((p) => p.type === "regex")) {
      if (typeof pattern.pattern === "string") continue;
      const match = pattern.pattern.exec(input);
      if (match) {
        const params = this.extractParams(pattern, match);
        return {
          intent: pattern.intent,
          confidence: 1.0,
          params,
          matched: true,
        };
      }
    }

    // 3. Try fuzzy match (fallback)
    let bestMatch: ParseResult | null = null;
    for (const pattern of this.patterns.filter((p) => p.type === "fuzzy")) {
      if (typeof pattern.pattern !== "string") continue;
      const distance = this.levenshteinDistance(
        input.toLowerCase(),
        pattern.pattern.toLowerCase()
      );
      const maxLen = Math.max(input.length, pattern.pattern.length);
      const confidence = 1 - distance / maxLen;
      const minConf = pattern.minConfidence ?? 0.8;

      if (confidence >= minConf) {
        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = {
            intent: pattern.intent,
            confidence,
            params: {},
            matched: true,
          };
        }
      }
    }

    return bestMatch;
  }

  /**
   * Extract parameters from regex match groups.
   */
  private extractParams(
    pattern: CommandPattern,
    match: RegExpExecArray
  ): Record<string, string> {
    const params: Record<string, string> = {};
    const paramNames = pattern.paramNames || [];

    for (let i = 1; i < match.length && i <= paramNames.length; i++) {
      params[paramNames[i - 1]] = match[i]?.trim() || "";
    }

    return params;
  }

  /**
   * Levenshtein distance (edit distance) between two strings.
   */
  private levenshteinDistance(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    return dp[m][n];
  }
}
