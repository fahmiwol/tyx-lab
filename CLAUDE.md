# CLAUDE.md — tyx-lab Instruction File
# Tiranyx Open Module Library
# Author: Fahmi Ghani / Tiranyx
# License: MIT

> Open source — use it wisely.

---

## NORTH STAR

This repo is **not a collection of projects.** It is a **knowledge extraction** of
everything Tiranyx builds — methods, patterns, calculations, frameworks, artifacts —
broken down into atomic units so anyone can stitch their own solution.

Every atom is born from a real, running system. Not theory. Not full apps — just the
smallest reusable piece, given away so people who don't want to dig can just use it.

**This library is LIVING.** See [AGENTS.md](AGENTS.md): every agent that works with
Tiranyx must contribute back — every skill, finding, method, atomic module, atomic
artifact. That contract is mandatory and overrides convenience.

---

## ATOMIC FIRST — THE CORE RULE

An atom = **one function, one responsibility.**

Test: *"Can this be used without any other atom in this repo?"*
- Yes → atomic → goes in `modules/` (code) or `artifacts/` (non-code)
- No → break it down further, or put it in `recipes/` as a combination

### Two lanes

| Lane | Contains | Structure |
|---|---|---|
| **`modules/`** | Atomic **code** (importable, one job) | `README.md` `LOGIC.md` `USAGE.md` `module.json` `src/` `examples/` |
| **`artifacts/`** | Atomic **non-code**: prompt, template, formula, method, playbook, framework, checklist, finding | `ARTIFACT.md` `artifact.json` + optional `assets/` |

Artifacts get a lighter, self-contained format on purpose: a prompt or a formula
should be one file you read and lift, not a five-file scaffold.

### module.json

```json
{
  "id": "slug-module",
  "name": "Human-Readable Name",
  "version": "1.0.0",
  "category": "ai | video | 3d | business | legal | ops | infra | crm | research | manufacturing",
  "description": "One sentence: what this module does",
  "input": ["input-type"],
  "output": ["output-type"],
  "tags": ["tag1", "tag2"],
  "compatible_with": ["other-slug"],
  "used_in_recipes": ["recipe-name"],
  "status": "stable | beta | experimental",
  "author": "Tiranyx",
  "license": "MIT"
}
```

### artifact.json

```json
{
  "id": "slug-artifact",
  "name": "Human-Readable Name",
  "version": "1.0.0",
  "kind": "prompt | template | formula | method | playbook | framework | checklist | finding",
  "category": "ai | video | 3d | business | legal | ops | infra | crm | research | manufacturing",
  "description": "One sentence: what this artifact gives you",
  "tags": ["tag1", "tag2"],
  "compatible_with": ["other-slug"],
  "used_in_recipes": ["recipe-name"],
  "status": "stable | beta | experimental",
  "author": "Tiranyx",
  "license": "MIT"
}
```

---

## SOURCES TO SCAN (priority order)

1. Local workspace roots (project folders)
2. Local research / archive folders
3. GitHub `github.com/fahmiwol` — repos
4. Internal GitLab — private repos
5. VPS / servers — running projects
6. Claude / Codex skills, session memory, findings
7. Memory context from the active session

> Extract everything reachable; record anything needing auth/SSH as a backlog.

### Per source

```
1. Read structure
2. Identify REUSABLE functions/patterns (not client-specific business logic)
3. Classify → module or artifact (or recipe if it's a combination)
4. Extract the logic → write the WHY
5. Anonymize all client data / credentials / project names / domains
6. Generate module.json / artifact.json
7. Write the docs
8. Flag to _unclassified/ if unclear
```

---

## CATEGORY TAXONOMY

| Category | Slug |
|---|---|
| AI Framework | `ai` |
| Video & Motion | `video` |
| 3D & Visual | `3d` |
| Business Modeling | `business` |
| Legal Templates | `legal` |
| Digital Ops | `ops` |
| Infrastructure | `infra` |
| CRM & Pipeline | `crm` |
| Research | `research` |
| Manufacturing | `manufacturing` |

---

## FILTER — IN vs OUT

### IN (safe to publish)
Reusable formulas, anonymized templates, thinking frameworks, research notes +
reasoning, generic UI/UX patterns, proven prompt patterns, standalone scripts/tools,
logic diagrams, playbooks, findings.

### OUT (never publish)
Client project source (full apps), client data / names / private domains,
credentials / keys / secrets, specific VPS config, business logic too specific to one
client, anything under a separate license / NDA.

---

## WRITING RULES

1. **The WHY is the soul** — write why, not just what.
2. **Every atom's docs are standalone.**
3. **Language: English** — all of it.
4. **Don't hardcode** cross-atom dependencies in `src/`.
5. **Anonymize** all client data, names, and domains.
6. **One PR = one atom.**
7. **Keep the "use wisely" spirit** — this is a gift given in good faith.

---

## DON'T

- Combine two functions in one atom
- Skip LOGIC.md / the Why section
- Skip module.json / artifact.json
- Publish credentials / client data / full apps / real project names or domains
- Re-frame this repo's direction — it is an atomic library, not a monolithic framework
- Create circular dependencies between atoms

---

## WORKFLOW

```
Scan → Classify → Extract → Anonymize → Document → Review → Record → Commit
         ↓
    Unclear?         → _unclassified/
    Has client data? → anonymize first
    Too specific?    → don't include it
```

When unsure: **ask whether this could be used by someone on a completely different
project.** Yes → in. No → skip.
