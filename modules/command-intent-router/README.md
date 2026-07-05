# Command Intent Router

## Purpose
Fast pattern-based command parsing for chatbots and CLIs. Extract intent and parameters from raw text using regex, exact match, or fuzzy string matching.

## Pattern
```
raw text input
  → try exact match (fast path)
  → try regex patterns (capture groups)
  → try fuzzy match (Levenshtein distance)
  → return { intent, confidence, params } or null
```

## Key Responsibilities
1. **Exact Matching**: Fast path for common commands
2. **Regex Patterns**: Extract parameters via capture groups
3. **Fuzzy Matching**: Handle typos/variations
4. **Priority Ordering**: Check high-confidence patterns first
5. **Parameter Extraction**: Normalize values (lowercase, trim, validate)

## Command Definition

```typescript
interface CommandPattern {
  intent: string;
  pattern: string | RegExp;
  type: "exact" | "regex" | "fuzzy";
  priority: number; // Higher = checked first
  params?: string[]; // Expected param names
  minConfidence?: number; // For fuzzy matching
}

// Example
const commands: CommandPattern[] = [
  {
    intent: "order_create",
    pattern: /^order\s+(\d+)\s+of\s+(.*?)(?:\s+for\s+(.+))?$/i,
    type: "regex",
    priority: 100,
    params: ["orderId", "product", "customer"],
  },
  {
    intent: "order_cancel",
    pattern: "cancel order",
    type: "exact",
    priority: 90,
  },
  {
    intent: "help",
    pattern: "help",
    type: "fuzzy",
    priority: 10,
    minConfidence: 0.8,
  },
];
```

## Parameter Extraction

```typescript
// Input: "order 12345 of widgets for John"
// Pattern: /^order\s+(\d+)\s+of\s+(.*?)(?:\s+for\s+(.+))?$/i

// Output:
{
  intent: "order_create",
  confidence: 1.0,
  params: {
    orderId: "12345",
    product: "widgets",
    customer: "John"
  }
}
```

## Fuzzy Matching

Uses Levenshtein distance to tolerate typos:
- "halp" → "help" (2 edits)
- "cnacel order" → "cancel order" (1 edit)

Configurable threshold:
```typescript
minConfidence: 0.8 // 80% similarity required
```

## Usage Example

```typescript
const router = new CommandIntentRouter(commands);

const result = router.parse("order 12345 of widgets for John");
// Returns: { intent: "order_create", confidence: 1.0, params: {...} }

const typo = router.parse("ordr 999 of gadgets");
// Partial match → { intent: "order_create", confidence: 0.75, params: {...} }

const unknown = router.parse("xyz123abc");
// No match → null
```

## Priority & Ordering

```
1. Exact match (priority order)
2. Regex match (priority order)
3. Fuzzy match (priority order, sorted by confidence)

If multiple patterns match:
  → Return highest priority
  → If tie, return highest confidence
```

## Parameter Validation

```typescript
{
  intent: "invoice",
  pattern: /^invoice\s+(\w+)\s+(\d+)$/,
  type: "regex",
  params: ["id", "amount"],
  validate: {
    id: (val) => val.length <= 20,
    amount: (val) => parseInt(val) > 0,
  }
}
```

## Performance Optimization

- **Exact match first**: O(1) lookup vs regex O(n)
- **Short-circuit on match**: Stop testing lower-priority patterns
- **Fuzzy only as fallback**: Expensive (Levenshtein is O(n²))

```typescript
// Typical order:
1. Exact match (high priority) → O(1)
2. Common regexes (high priority) → O(n)
3. Fuzzy match (fallback) → O(n²)
```

## Error Handling

```typescript
const result = router.parse(userInput);

if (!result) {
  return "I didn't understand that. Try: order [ID] of [product]";
}

if (result.confidence < 0.7) {
  return `Did you mean "${result.intent}"? (${Math.round(result.confidence * 100)}% match)`;
}

// Execute action for result.intent with result.params
```

## Testing Checklist
- [x] Exact match returns 1.0 confidence
- [x] Regex capture groups extracted correctly
- [x] Fuzzy match tolerates typos
- [x] Priority ordering respected
- [x] Parameter validation passes/fails correctly
- [x] Edge cases (empty, null, special chars)
- [x] Performance on large command sets (100+)

*Open source — use it wisely.*
