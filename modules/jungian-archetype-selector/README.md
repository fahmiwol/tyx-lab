# Jungian Archetype Selector

Canonical 12 Jungian brand archetypes for strategic positioning and narrative consistency.

## What It Does

Maps each archetype to:
- **Quadrant** (Stability, Belonging, Mastery, Independence)
- **Core motivation** and desire
- **Voice markers** (tone/personality keywords)
- **Brand positioning examples**

Use for:
- Brand strategy workshops and archetype selection
- Narrative consistency checks (does this message match the archetype?)
- Forcing orthogonal alternatives (each alternative uses different quadrant)
- Voice & tone calibration across copy

## Input

- Archetype name (string, one of 12)

## Output

- `ArchetypeProfile`: name, quadrant, motivation, core desire, examples, voice markers

## Usage

```typescript
import { 
  getArchetype, 
  getArchetypesInQuadrant, 
  validateOrthogonalSelection 
} from "@tiranyx/jungian-archetype-selector";

// Get single archetype
const hero = getArchetype("hero");
console.log(hero.voiceMarkers); // ["determined", "courageous", ...]

// Get all archetypes in a quadrant
const stabilityArchetypes = getArchetypesInQuadrant("STABILITY");
// [Caregiver, Ruler, Creator]

// Validate three alternatives span different quadrants
const isOrthogonal = validateOrthogonalSelection(["hero", "lover", "sage"]);
// true — Mastery, Belonging, Independence
```

## Dependencies

None. Pure data + utility functions.

## Why This Exists

Brand strategy requires a shared mental model. The 12 Jungian archetypes are battle-tested across Pentagram, Landor, Wolff Olins, and most top-tier brand studios. This module makes the typology machine-readable and queryable, so:

1. Team alignment happens faster (everyone references the same 12, not invented jargon)
2. Strategy validation is automatable (can check orthogonality, consistency)
3. Narrative generation can enforce archetype coherence

The examples are genericized — use them as starting points for your domain.

## Related Atoms

- `brand-schema-validator` — structure the brief that feeds archetype selection
- `brand-identity-framework` — output schema including archetype choice

Open source — use it wisely.
