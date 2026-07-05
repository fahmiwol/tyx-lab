# Agent Persona Registry — Why This Exists

## The Problem

Multi-agent systems (NPC worlds, bot ecosystems, microservice meshes) need a **single source of truth** for agent identity. Without it:

- Each tool/service reimplements persona schema differently (database column names, JSON keys, defaults)
- Skills/modules are stored in 5 places (agent table, skill table, assignment table, cache, config file)
- When you want to rename a skill or swap task modules, you hunt through disparate files
- New agents can't onboard without manual SQL/JSON edits in multiple places
- Runtime lookup is slow (multiple queries instead of one normalized cache hit)

## The Solution: Unified Registry

A **single schema** for agent identity that:

1. **Normalizes persona fields** — all agents use the same keys (id, name, role, skills, modules, color, avatarUrl, status)
2. **Decouples skill assignment from storage** — skills are facts, not schema columns
3. **Enables fast lookup** — memory-cache or single DB query per agent
4. **Scales to 100+ agents** — minimal overhead, one row per agent
5. **Versions cleanly** — add new fields to the schema without breaking existing registrations

## Why This Shape

### id, name, role
- **id**: immutable slug (e.g., `designer-npc`). Used as cache key, log trace, asset references.
- **name**: human name in the world (e.g., "Dina Mahesa"). Shown in UI, NPC dialogue.
- **role**: what they do (e.g., "Visual Designer"). Used for routing tasks, agent selection in workflows.

### skills: [string]
- List of capability labels (e.g., ["visual-design", "ai-image-generation"]).
- NOT method names or code signatures — they're business labels.
- Decoupled from the skill registry's actual implementation.
- Why not a SQL join table? → Single object fit for cache/JSON API/files.

### modules: [string]
- Task module IDs the agent can execute (e.g., ["visual_design", "media_generate"]).
- Maps to a task catalogue (separate system, one-to-many: agent can run many modules).
- Why list and not lookup? → Fast permission check at call time (O(1) hash membership test).

### color: integer
- UI rendering hint (0xRRGGBB). Avoids a separate styling DB.
- Kept because agent color is identity (logo/brand), not cosmetic — it's part of persona.

### avatarUrl: string
- URL to agent's 2D/3D portrait. Cached at client.
- Sourced once during agent creation (e.g., from generative API) and then frozen.
- Optional; defaults to generated initials if absent.

### status: enum
- "active", "paused", "maintenance", "archived".
- Used to filter agent lists and disable task routing without deleting the record.

## Trade-offs

✅ **Pros**
- Schema-first: document-oriented, JSON-friendly, no ORM impedance mismatch
- Single lookup: one cache hit instead of N queries
- Versioning: easy to add fields (skills_v2, experimental_modules, etc.)

❌ **Cons**
- No granular permissions per skill (use a separate ACL if needed)
- Lists (skills, modules) require denormalization; use a skill-to-agents index for reverse lookups

## How to Extend

If you need agent **quotas**, **API keys**, or **billing tiers**, add them as properties:
```json
{
  "id": "designer-npc",
  ...
  "quota": { "calls_per_day": 1000, "storage_mb": 5 },
  "api_key_id": "sk_designer_...",
  "billing_tier": "pro"
}
```

Then create a separate "agent-settings-store" or "agent-quota-engine" module.

---

Open source — use it wisely.
