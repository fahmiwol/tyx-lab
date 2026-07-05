# Repository Cartography & Doc Tier Classification

**Problem:** Large repos have docs scattered everywhere: README, docs/, ADRs, chat memory, wiki, inline comments. Agent onboarding takes hours. Docs contradict each other. Which doc wins on conflict?

**Solution:** Single PROJECT_CARTOGRAPHY.md (T0 file) that maps all docs into authority tiers (T0-T5), lists what's canonical vs historical, resolves conflicts, and describes runtime flow in 5-10 bullets.

## Tier Classification

### T0 — Operational Source of Truth
- One file per project: PROJECT_CARTOGRAPHY.md
- Updated every session
- Answers: which docs are canonical, what's blocked, key files, current focus
- Example: AGENT_CONTINUITY.md (handoff log), STATE_OF_PROJECT.md

### T1 — Sprint & Continuity
- Sprint backlog, deployment runbook, session log
- Updated weekly
- Example: SPRINT_LOG_2026-Q2.md, HANDOFF_LOG.md

### T2 — Domain Manuals
- Product requirements, architecture, revenue plan
- Updated per sprint or quarterly
- Example: PRD.md, ARCHITECTURE.md, REVENUE_PLAN.md

### T3 — ADRs & Historical Design
- Architectural decisions, past explorations
- Rarely updated; may be superseded
- Example: ADR-001-database-choice.md, OLD-DESIGN-DOCUMENT.md

### T4 — Reference & API Docs
- Database schema, API specs, library reference
- Auto-generated or infrequently updated
- Example: schema.prisma, OpenAPI.yml, SDK docs

### T5 — Archive & Legacy
- Old sprints, deprecated features, removed code
- Read only for historical context
- Example: 2024-archived/, LEGACY-NOTES.md

## Template: PROJECT_CARTOGRAPHY.md



## Creation Process

1. **Inventory:** List all markdown files in docs/ + root + .agents/ + scripts/
2. **Classify:** Sort into T0-T5 based on update frequency + authority
3. **Resolve conflicts:** If two docs claim to be truth (e.g., two PRDs, README vs code), declare winner
4. **Runtime flow:** Read entry point + trace 5-10 major code paths → bullet list
5. **Coverage:** Document what was read end-to-end vs skimmed vs skipped (and why)
6. **Link:** Pair with AGENT_CONTINUITY.md for session handoffs
7. **Maintain:** Update every sprint or when major doc added/removed

## Benefits
1. New agent reads ONE file (PROJECT_CARTOGRAPHY.md) to understand repo
2. Explicit conflict resolution — no ambiguity
3. Living doc: stays in sync as project evolves
4. Audit trail: who updated it, when, why (via git log)
5. Scalable: works for 5KB repo or 500KB monorepo

## Anti-Patterns
❌ "Every doc is equally true" → confusion + contradictions
✅ T0-T5 tiers → single source of truth + clear fallback

❌ Cartography lives in Notion/Slack → agent can't read
✅ Cartography in git → versioned, reliable, linked

*Open source — use it wisely.*
