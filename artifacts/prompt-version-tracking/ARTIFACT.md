# Prompt Version Tracking

**The Pattern:** Version your system prompts. Tag each generation with the prompt version. Use the cost log to correlate quality with prompt iteration.

## Why

LLM outputs vary by prompt. To understand which prompt performs better:
- You need to know which prompt generated which output
- You need cost data (tokens, latency) per prompt version
- You need quality metrics (user rating, validation pass rate) per version
- You then compare and iterate

Without versioning, all generations blur together and A/B testing becomes impossible.

## The Method

### 1. Version the Prompt

Keep prompts in version control or a prompt registry:

```typescript
// prompts/index.ts
export const SYSTEM_PROMPTS = {
  brand_strategy: {
    "0.1.0": `You are a senior brand strategist...`,
    "0.2.0": `You are a brand strategist with expertise in positioning...`,
    "0.3.0": `You are a brand strategist. Think step-by-step...`,
  }
};

export const PROMPT_VERSION = "0.3.0"; // Current production version
```

### 2. Tag Each Generation

When you call the LLM, include the prompt version in the cost log:

```typescript
async function generateBrandStrategy(brief) {
  const promptVersion = PROMPT_VERSION;
  const messages = [
    { role: "system", content: SYSTEM_PROMPTS.brand_strategy[promptVersion] },
    { role: "user", content: JSON.stringify(brief) }
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.7,
  });

  // Log the generation with version tag
  await logGeneration({
    promptVersion,
    inputTokens: response.usage.prompt_tokens,
    outputTokens: response.usage.completion_tokens,
    generatedAt: new Date().toISOString(),
    qualityScore: null, // Will be filled by user feedback
  });

  return response.choices[0].message.content;
}
```

### 3. Collect Quality Metrics

Let users rate the output or measure pass rates:

```typescript
// After user review
await updateGenerationQuality({
  generationId,
  qualityScore: userRating, // 1-5 stars
  validationPassed: checkValidation(output),
  feedback: userNotes,
});
```

### 4. Analyze Aggregate Metrics

Query the cost log by prompt version:

```typescript
// SQL or ORM query
const results = db.generations
  .where({ promptVersion: "0.3.0" })
  .group_by("promptVersion")
  .aggregate({
    avgQualityScore: avg(qualityScore),
    avgTokenCost: avg(inputTokens + outputTokens),
    passRate: sum(validationPassed) / count(*),
  });

// Results:
// promptVersion  avgQualityScore  avgTokenCost  passRate
// 0.1.0          3.2              412           78%
// 0.2.0          3.8              398           85%
// 0.3.0          4.1              405           91%  ← Winner
```

## Benefits

1. **Data-driven iteration** — Know which prompts perform best, not guesses
2. **Cost visibility** — See which versions are more token-efficient
3. **Reproducibility** — Regenerate exact outputs by prompt version
4. **Audit trail** — Track which version was used for compliance

## Pitfalls

- **Forgetting to tag** — Logs must always include prompt version; add it to your LLM client wrapper
- **Confusing prompt version with output version** — Keep them separate (prompt is input, output ID is the result)
- **Not collecting quality data** — A/B testing requires feedback; make it part of the workflow
- **Changing the prompt without versioning** — Bump the version number every time, even minor tweaks

## Example: Full Workflow

```typescript
// 1. Define prompts with versions
const BRAND_PROMPTS = {
  v1: "You are a brand strategist...",
  v2: "You are an expert brand strategist focusing on differentiation..."
};

// 2. Call LLM with version tag
const generation = await generateWithVersion(
  brief,
  BRAND_PROMPTS.v2,
  "brand_strategy",
  "0.2.0"
);

// 3. Log with cost data
await costLog.insert({
  promptVersion: "0.2.0",
  modelUsed: "gpt-4o",
  inputTokens: generation.usage.prompt_tokens,
  outputTokens: generation.usage.completion_tokens,
  elapsedMs: generation.elapsedMs,
  content: generation.output,
  createdAt: new Date(),
});

// 4. Collect user feedback
const userRating = await getUserRatingForGeneration(generation.id);
await costLog.update(
  { id: generation.id },
  { qualityScore: userRating }
);

// 5. Analyze (after 100+ generations per version)
const analysis = await analyzePromptPerformance("brand_strategy");
// Tells you: which version won, cost/quality tradeoffs, recommended next prompt
```

## When to Use

- Youre iterating on a prompt and want to measure progress
- You have multiple prompt variants and want to compare
- You care about cost AND quality (not just speed)
- Your team needs audit trail of which prompt generated which output

Open source — use it wisely.
