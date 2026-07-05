# Brand Schema Validator

Zod validation schema for 5-step brand brief intake. Validates form input, LLM output, and database rows with a single schema definition.

## What It Does

Defines the canonical structure for brand strategy briefs:
1. **Business**: Name, category, sales channels, backstory
2. **Market**: Target audience, geography, 1–5 competitors, differentiation
3. **References**: Mood board links, visual preferences (optional)
4. **Personality**: Archetype choice, tone sliders (5 dimensions 0–100), voice keywords
5. **Context**: Output language, cultural flags, budget tier, notes

## Input

- Raw form data (POST body, LLM output, user input)

## Output

- Validated `Brief` object (type-safe)
- Parse errors with field-level context

## Usage

```typescript
import { 
  parseBrief, 
  safeParseBrief, 
  stepValidators,
  Brief 
} from "@tiranyx/brand-schema-validator";

// Full brief validation
const brief: Brief = parseBrief({
  business: {
    brandName: "Example Brand",
    businessCategory: "Sustainable Fashion",
    sellingDescription: "Ethical clothing for conscious consumers",
    salesChannels: ["web", "wholesale"],
  },
  market: {
    targetMarket: "Age 25–45, urban, sustainability-minded",
    geographyFocus: ["North America", "Europe"],
    competitors: [
      { name: "Competitor A", positioning: "Luxury ethical" },
    ],
    distinctiveDifferentiator: "Local artisan sourcing",
  },
  personality: {
    archetypePreference: "creator",
    toneSliders: {
      formal_casual: 35,
      serious_playful: 60,
      classic_modern: 75,
      authoritative_friendly: 50,
      luxury_accessible: 40,
    },
    wordsToEmbrace: ["craft", "intention", "local"],
    wordsToAvoid: ["cheap", "mass-produced"],
  },
  context: {
    outputLanguage: "en",
    budgetTier: "standard",
  },
});

// Safe parsing (doesnt throw)
const result = safeParseBrief(data);
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error.issues);
}

// Step-by-step validation (multi-step form)
const businessData = await validateStep("business", formData);
```

## Dependencies

- `zod` (peer dependency)

## Why This Exists

Brand strategy requires structured intake. Without a schema:
- Forms validate manually (error-prone)
- LLMs generate inconsistent output shapes
- Database inserts fail silently
- Frontend/backend stay out of sync

This module makes the brief **a contract**:
1. Same schema enforces consistency everywhere
2. Type safety prevents field mismatches
3. Validation errors are granular (which field, why)
4. LLM output can be validated automatically

The 5-step structure mirrors real brand workshops: start with business reality, narrow to market position, inspire with references, choose personality, then contextualize.

## Related Atoms

- `jungian-archetype-selector` — provides valid archetype values
- `design-tokens-generator` — used in step 4 tone calibration UI

Open source — use it wisely.
