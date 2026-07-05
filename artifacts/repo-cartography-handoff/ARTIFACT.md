# Repository Cartography & Agent Handoff

**Kind:** method · **Category:** ops · **Status:** stable

A reusable pattern for making a large repo legible: a tiered document list, folder
roles, a short runtime flow, an explicit conflict table (which doc wins), an honest
coverage section, and a living handoff log — so any agent or teammate can orient in
one hop.

---

## Why this exists

In a multi-document monorepo, truth is scattered across README, `docs/`, ADRs, and
chat memory, and they contradict each other. Handoffs between agents (each with weekly
usage limits) lose context. This method fixes which document wins on conflict and
leaves a durable map, so the next session starts oriented instead of re-deriving.

## When to use

- Multi-document monorepo where truth is spread out.
- Handoff between different agents/tools.
- Before a big refactor — establish which document is authoritative.

## Steps

1. **Inventory** top-level dirs and entrypoints (`package.json`, main server file, app entry).
2. **Classify docs into tiers:**
   - **T0** — operational source of truth (the team "memory" / `AGENTS.md` equivalent).
   - **T1** — sprint / continuity / review boards.
   - **T2** — domain manuals (product, revenue, architecture).
   - **T3** — ADRs / PRDs (may be historical — flag if superseded by code).
3. **Runtime diagram** — 5-10 bullets: boot -> config -> API -> UI.
4. **Conflicts** — an explicit table: "File A says X, code/B says Y -> follow B until A updated."
5. **Honest coverage** — list what was read end-to-end vs skimmed vs not read.
6. **Living log** — pair with an `AGENT_CONTINUITY.md`: session id, date, agent, diff summary, follow-ups.

## Output artifact

A single `PROJECT_CARTOGRAPHY.md` (or `REPO_MAP.md`) under `docs/` with the sections
above, linked from the primary agent-instructions file so discovery is one hop.

## Security pass (always)

Scan docs for API keys, tokens, and private URLs. Remove them; use env placeholders.
Note rotation in the continuity log if a key may have been exposed.

---

*Open source — use it wisely.*