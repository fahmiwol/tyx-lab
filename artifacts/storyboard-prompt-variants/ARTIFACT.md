# Storyboard Prompt Factory — Multi-Variant Template Pipeline

## Purpose
Generate video storyboards (shot-by-shot breakdowns) with LLM, supporting multiple content genres (product ads, cinematic stories, generic narratives) with unified JSON output schema.

## Problem
- **Variant explosion**: Different content types (e-commerce ads, YouTube shorts, narrative films) need different narrative structures, pacing, and visual constraints
- **Prompt coupling**: Storyboard logic scattered across route handlers, duplicating LLM prompt boilerplate
- **Schema drift**: Each variant could produce different JSON structures → downstream normalization breaks
- **Reusability**: Can't compose prompt logic across projects

## Solution
Modular prompt builder per variant (product_ad, cinematic_story, generic), each producing identical JSON contract: `{ scenes: [{ title, purpose, objective, visualDescription, characterAction, narration, textOverlay, cameraAngle, cameraMovement, audioNotes, transitionOut, durationSeconds }] }`.

All variants accept project context (duration, aspect ratio, target audience, mood) and visual DNA constraints, ensuring downstream pipeline (parse→normalize→keyframe→render) never needs to know which variant was used.

## Key Patterns
1. **Variant isolation** — Each `buildXxxPrompt()` returns complete prompt string, free to use unique structure & narrative instruction
2. **Unified JSON spec** — All variants embed identical `jsonSpec()` footer guaranteeing output schema
3. **Context injection** — Project + visual DNA passed to all variants; variants adapt instruction (e.g. "affiliate tone" vs "cinematic storytelling")
4. **Hook engine** — Separate `buildHookPrompt()` for generating N alternative 3-sec openers (A/B test variants)
5. **Downstream agnostic** — Parser, scene normalizer, and render pipeline never branch on variant; they consume scenes[] contract

## Output
- Export: `buildStoryboardPrompt(opts) → { prompt: string, variant: enum }`
- Hook generator: `buildHookPrompt(opts) → string` (produces JSON array of alternatives)
- Consumable by any LLM (Claude, GPT, Gemini)

## Used in
- Migancore Motion Director (product ads, cinematic short scripts)
- Generic video pipeline (any storyboard→shot→render workflow)

---

*Open source — use it wisely.*
