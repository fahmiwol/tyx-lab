<div align="center">

# tyx-lab

**Tiranyx Open Module Library**

Atomic modules & artifacts extracted from real, running systems.
Not full apps. Not theory. Small, documented building blocks you stitch together yourself.

**Open source — use it wisely.**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-living-brightgreen)]()

[**Modules →**](modules/) · [**Artifacts →**](artifacts/) · [**Recipes →**](recipes/) · [**Contribute →**](CONTRIBUTING.md)

</div>

---

## What is this?

Every atom here was pulled from a real system and stripped down to its smallest
reusable unit. The rule: **each atom does exactly one thing.** You stitch them
together your way, for your system.

Made for people who don't want to dig through someone's whole codebase — take the
piece, read the reasoning, use it.

**Two lanes:**

```
modules/     ← atomic CODE  (importable, one job)
artifacts/   ← atomic NON-CODE (prompts, templates, formulas, methods, playbooks, findings)
recipes/     ← how to stitch several atoms into a use case
```

No monolith. No magic. Just building blocks with honest documentation — every one
explains not just *how* it works, but *why* it was built that way.

---

## Categories

| Category | Slug | Examples |
|---|---|---|
| AI Framework | `ai` | prompt chains, agent designs, epistemology patterns |
| Video & Motion | `video` | motion, timeline, rendering — split by layer |
| 3D & Visual | `3d` | 2D-to-3D, preview, editor logic |
| Business | `business` | pricing/margin models, quota & wallet logic, scenario planning |
| Legal | `legal` | contract templates, IP clauses, cooperation agreements |
| Ops | `ops` | campaign methodology, reporting patterns, email templates |
| Infra | `infra` | deploy recipes, multi-tenant routing, crypto utilities, tracking |
| CRM | `crm` | pipeline logic, SLA engines, bounce classification |
| Research | `research` | frameworks, verification patterns, findings |
| Manufacturing | `manufacturing` | process math, cost modeling |

---

## How to use

Each atom is self-contained. For a **module**, read its `LOGIC.md` first — that is
where the *why* lives — then `USAGE.md`. For an **artifact**, the single `ARTIFACT.md`
holds everything.

```bash
git clone https://github.com/fahmiwol/tyx-lab
cd tyx-lab
# browse modules/ and artifacts/, lift what you need
```

For combining atoms, see [`recipes/`](recipes/).

---

## This is a living library

New atoms land here continuously. Every agent and collaborator that builds something
reusable extracts it back into this repo — that contract is written in
[AGENTS.md](AGENTS.md). The atoms are the open layer of a larger ecosystem
(Mighanworld, Migancore, Ixonomic); this repo is the part given freely.

---

## Contribute

Found a pattern here useful? Leave a ⭐ — it helps other builders find it.

Want to add one? **One PR = one atom.** The `LOGIC.md` (or the artifact's *Why*
section) is mandatory. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

<div align="center">

Built and maintained by Fahmi Ghani · Tiranyx · MIT License

*Real tools from a real builder. Use them freely, use them wisely.*

</div>
