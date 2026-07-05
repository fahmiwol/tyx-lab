# AGENTS.md — The Living Contract

**This repository is alive.** It is not a snapshot. Every agent that works with
Fahmi Ghani / Tiranyx — Claude Code, Codex, or any other — is bound by this file.

If you are an AI agent reading this: **you are a contributor, not just a user.**
Whatever you build, discover, or figure out that is reusable, you extract it here
before you finish. That is the deal. No exceptions.

> Open source — use it wisely.

---

## The Prime Directive

> **Whenever you produce something reusable, leave an atom behind.**

A "reusable something" is any skill, method, finding, pattern, formula, template,
prompt, script, or config that could help a *different* person on a *different*
project. If it only matters to one client, one app, one session — it does not
belong here. If it could save a stranger an afternoon — it does.

You do not need permission to add an atom. You need permission to add a *bad* one.

---

## Two kinds of atoms

| Lane | What lives here | Shape |
|---|---|---|
| **`modules/`** | Atomic **code** — one function, one responsibility, importable | `README.md` + `LOGIC.md` + `USAGE.md` + `module.json` + `src/` + `examples/` |
| **`artifacts/`** | Atomic **non-code** — a prompt, template, formula, method, playbook, framework, checklist, or finding | `ARTIFACT.md` + `artifact.json` + optional `assets/` |

**The test for either:** *"Can someone use this on a completely different project,
without the rest of my systems?"* — Yes → it is an atom. No → break it smaller, or drop it.

Combinations of atoms go in **`recipes/`**. Anything you are unsure about goes in
**`_unclassified/`** with a note — never force a bad classification.

---

## The extraction ritual (every session)

```
1. SCAN     — what did I just build / find / fix that was reusable?
2. ATOMIZE  — reduce it to the smallest standalone unit. One thing only.
3. ANONYMIZE— strip every client name, credential, key, internal IP/domain, and
              client-specific business rule. Replace with generic placeholders.
4. DOCUMENT — write the WHY (LOGIC.md / the Why section), not just the how.
5. CLASSIFY — module or artifact? pick a category. Unsure -> _unclassified/.
6. RECORD   — add/update the entry in index.json.
```

If you scanned and found nothing worth extracting, that is a valid outcome — say so.
Do not manufacture filler atoms to look busy.

---

## Anonymization — non-negotiable

**Never publish:**

- Client source code, full applications, or client-specific business logic
- Client names, project names tied to a client, or identifying data
- Credentials, API keys, tokens, secrets, .env values
- Internal IPs, private domains, VPS hostnames, server paths
- Anything under a separate license or NDA

**Always publish the reusable essence, made generic.** A client's tracking wiring
becomes "a Meta CAPI dedup pattern." A client's pricing sheet becomes "a margin
formula." Keep the knowledge, drop the identity.

When in doubt, ask: *"Would I be comfortable if a competitor read this?"* If the
answer depends on it being secret, it does not go in. If it is just good craft — it does.

---

## Quality bar

- **One PR / one commit = one atom.** Never mix two atoms in one change.
- **English only** — code, identifiers, and prose.
- **The WHY is mandatory.** A module without `LOGIC.md`, or an artifact without a
  "Why this exists" section, is incomplete. Anyone can copy code; the value is
  knowing when and why to.
- **No cross-atom hard dependencies in `src/`.** Atoms compose by being stitched.
- **Self-contained docs.** Never assume the reader has seen another atom.

---

## For humans skimming this

You found this repo and you do not want to dig through someone's entire codebase.
Good — that is who it is for. Every folder here is one small, finished, documented
piece you can lift and use. Read the `LOGIC.md` (or the Why section) first; that is
where the judgment lives. Then stitch what you need, your way.

Use it wisely, and if it helped, pass it on.
