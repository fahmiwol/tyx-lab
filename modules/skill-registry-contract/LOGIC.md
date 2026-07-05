# Skill Registry Contract Pattern — Why This Exists

## The Problem

Agent skills (LLM tool definitions) are often defined ad-hoc, leading to:

- Inconsistent descriptions (tool says "does X" but actually does X+Y+Z)
- Undocumented parameters (agent calls with wrong argument types)
- Silently missing required fields (skill defined, tool def incomplete, LLM told nothing)
- Runtime surprises (skill fails in production because description was wrong)
- Duplication (same skill registered in 3 places with different parameter names)
- No discoverability (what skills exist? what do they need? hidden until runtime)

## The Solution: Contract-Enforced Registry

Define skills with a **strict schema**, validated **at gateway boot**:

1. **Mandatory description** — every skill must describe what it does
2. **Typed parameters** — each param has type (string/int/bool/enum), description, constraints
3. **Boot-time validation** — missing or invalid schema → exception at startup, never at call time
4. **Self-documenting** — skill registration IS the documentation (no separate wiki)
5. **One canonical location** — all skill definitions in one registry; reuse everywhere

## Why This Shape

### name: string
- Unique skill ID (e.g., `visual_design`, `content_review`)
- Used in agent assignments and logging

### description: string
- **Mandatory**. Plain English describing what the skill does.
- Not optional; boot fails without it (enforced by validator)
- Example: "Create visual design concepts with mood boards, color palettes, and asset recommendations"

### params: { param_name: { type, description, ... } }
- Each parameter explicitly typed (string, integer, boolean, enum)
- Each parameter documented (why does the skill need it?)
- `enum` for constrained choices (style: ['modern', 'vintage', 'minimalist'])
- `required`, `default` for defaults and optionality

### handler: async (params, context) => result
- The implementation
- Signature enforced (receives params dict + optional context)
- Returns string or structured result (spec says "string", but many handlers return JSON)

### capabilities: [string] (optional)
- High-level tags (e.g., ["can_create", "can_edit", "can_review"])
- Used by router to find skills by capability (more flexible than hardcoding skill name)

## Why Boot-Time Validation Matters

Three approaches to skill misconfiguration:

1. **No validation** — skill deployed, LLM calls it, param mismatch → "Sorry, I crashed"
2. **Runtime validation** — agent tries to use skill, validator throws → slow feedback
3. **Boot-time validation** — gateway starts up, registry validates all skills → fail fast, never reach prod

Boot-time is best because:
- Developer sees the error immediately (when testing locally)
- Misconfigured skill never reaches production
- Cost: one extra loop at startup (negligible)

## Trade-offs

✅ **Pros**
- Catches errors before deployment
- Self-documenting (skill definition = tool card for LLM)
- Prevents duplicates (registry is single source of truth)
- Enables skill discovery (list all skills, find by capability)
- Easier testing (validate skills in test suite)

❌ **Cons**
- Requires discipline (update registry when adding skill)
- Can't evolve parameter schema without versioning (if param type changes, old agents break)
- Overhead (validation loop at boot, but minimal)

## How to Extend

### Versioning skills:
```javascript
defineSkill({
  name: 'visual_design',
  version: '2.0.0',  // bumped from 1.0.0
  description: 'Create visual designs (now supports 3D previews)',
  params: { /* ... */ }
});
```

### Deprecation:
```javascript
defineSkill({
  name: 'visual_design',
  status: 'deprecated',
  replacedBy: 'visual_design_v2',
  description: 'DEPRECATED. Use visual_design_v2 instead.'
});
```

### Async constraints (advanced):
```javascript
defineSkill({
  name: 'visual_design',
  params: {
    style: {
      type: 'enum',
      values: async () => {
        // fetch available styles from API at boot
        return await db.query('SELECT DISTINCT style FROM designs');
      }
    }
  }
});
```

---

Open source — use it wisely.
