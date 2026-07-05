/**
 * Brand Brief Schema — Zod validation
 *
 * Single source of truth for brand intake forms.
 * Validates form input → server action → LLM structured output → database insert.
 *
 * The 5-step flow:
 * 1. Business (name, category, channels)
 * 2. Market (target, competitors, differentiation)
 * 3. References (mood board, visual preferences)
 * 4. Personality (archetype, tone sliders, voice keywords)
 * 5. Context (language, cultural flags, budget)
 *
 * TypeScript types auto-inferred from schemas.
 *
 * Open source — use it wisely.
 */

import { z } from "zod";

// ---- TONE & PERSONALITY ----
export const toneSlidersSchema = z.object({
  formal_casual: z.number().min(0).max(100),
  serious_playful: z.number().min(0).max(100),
  classic_modern: z.number().min(0).max(100),
  authoritative_friendly: z.number().min(0).max(100),
  luxury_accessible: z.number().min(0).max(100),
});
export type ToneSliders = z.infer<typeof toneSlidersSchema>;

export const archetypeSchema = z.enum([
  "caregiver", "ruler", "creator",
  "jester", "everyman", "lover",
  "hero", "outlaw", "magician",
  "innocent", "sage", "explorer",
]);
export type Archetype = z.infer<typeof archetypeSchema>;

// ---- STEP 1: BUSINESS ----
export const businessStepSchema = z.object({
  brandName: z.string().min(1).max(200),
  businessCategory: z.string().min(1).max(100),
  sellingDescription: z.string().min(1).max(500),
  salesChannels: z.array(z.string()).min(1),
  brandBackstory: z.string().max(500).optional(),
});
export type BusinessStep = z.infer<typeof businessStepSchema>;

// ---- STEP 2: MARKET ----
export const marketStepSchema = z.object({
  targetMarket: z.string().min(1).max(600),
  geographyFocus: z.array(z.string()).min(1),
  competitors: z.array(z.object({
    name: z.string(),
    positioning: z.string().optional(),
  })).min(1).max(5),
  distinctiveDifferentiator: z.string().min(1).max(400),
});
export type MarketStep = z.infer<typeof marketStepSchema>;

// ---- STEP 3: REFERENCES (Optional) ----
export const referencesStepSchema = z.object({
  moodboardUrls: z.array(z.string().url()).optional(),
  moodPreferences: z.array(z.string()).optional(),
  moodAvoids: z.array(z.string()).optional(),
}).optional();
export type ReferencesStep = z.infer<typeof referencesStepSchema>;

// ---- STEP 4: PERSONALITY ----
export const personalityStepSchema = z.object({
  archetypePreference: z.union([archetypeSchema, z.literal("auto")]),
  toneSliders: toneSlidersSchema,
  wordsToEmbrace: z.array(z.string()).optional(),
  wordsToAvoid: z.array(z.string()).optional(),
});
export type PersonalityStep = z.infer<typeof personalityStepSchema>;

// ---- STEP 5: CONTEXT ----
export const contextStepSchema = z.object({
  outputLanguage: z.string().default("en"),
  culturalFlags: z.record(z.string(), z.boolean()).optional(),
  budgetTier: z.enum(["bootstrap", "standard", "premium"]).default("standard"),
  extraNotes: z.string().max(1000).optional(),
});
export type ContextStep = z.infer<typeof contextStepSchema>;

// ---- FULL BRIEF ----
export const briefSchema = z.object({
  business: businessStepSchema,
  market: marketStepSchema,
  references: referencesStepSchema,
  personality: personalityStepSchema,
  context: contextStepSchema,
});
export type Brief = z.infer<typeof briefSchema>;

/**
 * Validate and parse a brief
 */
export function parseBrief(input: unknown): Brief {
  return briefSchema.parse(input);
}

/**
 * Safe parse with error reporting
 */
export function safeParseBrief(input: unknown) {
  return briefSchema.safeParse(input);
}

/**
 * Step-by-step validation (useful for multi-step forms)
 */
export const stepValidators = {
  business: (input: unknown) => businessStepSchema.parse(input),
  market: (input: unknown) => marketStepSchema.parse(input),
  references: (input: unknown) => referencesStepSchema.parse(input),
  personality: (input: unknown) => personalityStepSchema.parse(input),
  context: (input: unknown) => contextStepSchema.parse(input),
};
