# JSON Schema Repair & Fallback Parser — LLM Output Recovery

## Purpose
Parse and repair malformed JSON responses from LLMs (missing quotes, escaped newlines, comments, extra commas) with progressive fallback strategies — extract partial structure when full repair fails.

## Problem
- **LLM JSON brittleness**: Even with `format: json` or JSON schema constraints, models output near-JSON (extra commas, missing quotes, inline comments)
- **Naive parsing fails**: `JSON.parse()` or strict schema validation rejects entire response; lose all data
- **No graceful degradation**: Binary success/failure; no "best effort" extraction
- **Silent data loss**: Partial outputs silently dropped; user has no idea what was attempted

## Solution
Multi-stage repair pipeline:
1. **Syntax repair** — Detect & fix common LLM mistakes (trailing commas, unquoted keys, escaped newlines)
2. **Coercion** — Type mismatches (string ↔ number, null ↔ empty); apply schema hints
3. **Partial extraction** — If full schema fails, extract valid top-level fields, leave invalid ones null/default
4. **Fallback chain** — LLM retry with refined schema → default template → empty record
5. **Audit & signal** — Emit repair metadata: `{ attempted_parse, repairs_applied, confidence, extracted_fields }`

Each repair step is optional and ordered by cost (cheap syntax fixes first, expensive LLM re-call last).

## Key Patterns
1. **Syntax fixing** — Regex/AST-light approach (not full re-parsing): remove comments, fix trailing commas, quote bare keys
2. **Schema-aware coercion** — If schema says field is number but value is string "42", convert; if string "null", use default
3. **Partial mode** — Parse top level, skip invalid nested fields; return `{ field: validated_value, bad_field: null }`
4. **Retry with hint** — If repair fails, send LLM a CORRECTED invalid JSON sample + schema; ask to regenerate valid
5. **Observability** — Log repair attempts + reasons → post-analysis on which prompts produce broken JSON most often

## Output
- Parser factory: `createJSONRepairParser(schema) → { parse(text) → { data, repairs, confidence, fallback_used } }`
- Repair steps: chainable; each `(text, schema) → { repaired: text, success: bool, reason: string }`
- Partial extractor: `extractPartial(text, schema) → { extracted: any, missing: string[], confidence: 0..1 }`

## Used in
- Migancore storyboard generation (repair scene JSON from LLM)
- Sidix prompt execution (parse agent outputs with lenient schema)
- Any LLM workflow where strict parsing would lose data

---

*Open source — use it wisely.*
