# Recipe: Brand System Builder

## Description
From a filled brief to a full brand system: validate the brief, pick an archetype, apply a
positioning framework, and emit design tokens ready for code.

## Atoms Used
1. `artifacts/brief-intake-framework` — capture a complete, layered brief
2. `modules/brand-schema-validator` — validate the brief (Zod) into typed data
3. `modules/jungian-archetype-selector` — map to a brand archetype + voice
4. `artifacts/brand-identity-framework` — Aaker + Golden Circle + Onlyness positioning
5. `modules/design-tokens-generator` + `artifacts/design-system-starter` — emit tokens (CSS vars + Tailwind)

## Execution Order
brief-intake-framework -> brand-schema-validator -> jungian-archetype-selector -> brand-identity-framework -> design-tokens-generator + design-system-starter

## Final Output
A validated brief, an archetype-driven voice, a positioning statement, and code-ready design tokens.

*Open source — use it wisely.*