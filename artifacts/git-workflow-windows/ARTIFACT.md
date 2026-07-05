# Git Workflow — Windows + Private GitHub Repo

**Kind:** playbook · **Category:** infra · **Status:** stable

A lean git workflow tuned for the friction points of Windows + a private GitHub repo:
token auth (not passwords), conventional commit messages, Windows path pitfalls in git
Bash, and safe undo/recovery.

---

## Why this exists

The generic git happy path is well documented; what bites on Windows + private repos is
specific: HTTPS auth wants a Personal Access Token, git Bash mishandles backslash paths
and spaces, and machine-specific files (build shims, generated types) sneak into
commits. This captures just those deltas.

## Setup (once per project)

```bash
git init && git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
```

Auth: when prompted for a password, use a **Personal Access Token** (Settings ->
Developer Settings -> Personal Access Tokens -> classic, scope `repo`). Store it in a
password manager, never in the repo.

## Conventional commits

`type(scope): description` — types: `feat`, `fix`, `docs`, `style`, `refactor`,
`chore`, `perf`. Example: `fix(build): add exFAT readlink patch`.

## .gitignore essentials

```
.env.local        # secrets
node_modules/
.next/            # build output
*-types.ts        # auto-generated
fix-exfat.cjs     # machine-specific shims
```

## Windows path pitfalls (git Bash)

- Use forward slashes: `C:/work/project`, not `C:\work\project`.
- Quote paths with spaces: `"C:/web app/project"`.

## Safe undo / recovery

```bash
git reset --soft HEAD~1          # undo last commit, keep changes staged (pre-push)
git pull origin main --rebase    # "remote contains work" -> rebase then push
```

---

*Open source — use it wisely.*