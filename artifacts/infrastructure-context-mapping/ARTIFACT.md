# Infrastructure Context Mapping

> Method for documenting infrastructure to prevent execution errors in multi-server, multi-repo projects.

## Context

Multi-project environments often have:
- Multiple servers (production, training, staging)
- Multiple repositories (monorepo vs multi-repo)
- Different authentication credentials per server
- Complex networking and deployment patterns

Without documented mapping, teams risk:
- SSH'ing to the wrong server
- Deploying to staging instead of production
- Using expired SSH keys
- Not knowing which repo corresponds to which server
- Duplicating work across similar projects

This pattern documents the essential mappings without exposing sensitive infrastructure details.

---

## Core Mappings

### Server Inventory

List every server involved in the project:

| Server | Role | Provider | Network | Auth | Purpose |
|--------|------|----------|---------|------|---------|
| [PRODUCTION-VPS] | Production | VPS provider | Public + Firewall | SSH key + MFA | Inference, API serving |
| [GPU-CLOUD] | Training | RunPod/Vast.ai | Public | API key | Model training only |
| [STAGING-VPS] | Staging | Same provider | Private/Internal | SSH key | Pre-release testing |
| [LOCAL] | Development | Your machine | Local | N/A | Code editing, testing |

**Key rules:**
- **No IP addresses** in documentation (use server aliases instead)
- **No credentials** in shared docs (store in password manager)
- **No SSH keys** in repos (use `~/.ssh/config` instead)
- Always reference via alias (e.g., `production-vps`, never actual IPs)

### Repository Mapping

| Repo | Remote | Local Path | Server | Purpose | Deploy |
|------|--------|-----------|--------|---------|--------|
| `backend` | GitHub/GitLab | `local/backend/` | Production VPS | Core API | CI/CD pipeline |
| `platform` | GitHub/GitLab | `local/platform/` | GitHub Pages | Package dist | Auto on main push |
| `community` | GitHub/GitLab | `local/community/` | GitHub only | Open source | Manual release |
| `ml-training` | GitHub (private) | `local/ml-training/` | GPU Cloud | Training scripts | Manual trigger |

**Key rules:**
- Each repo has exactly one "source of truth" location
- Pulling from git is safer than editing on server
- Production code lives in version control

### Git Configuration

Example `~/.ssh/config`:

```
Host production-vps
    HostName [HOSTNAME_ALIAS]
    User [SSH_USER]
    IdentityFile ~/.ssh/[KEY_NAME]
    StrictHostKeyChecking accept-new

Host gpu-cloud-1
    HostName [HOSTNAME_ALIAS]
    User [SSH_USER]
    IdentityFile ~/.ssh/[GPU_KEY_NAME]
```

Then SSH like:
```bash
ssh production-vps    # Never have to remember IPs
ssh gpu-cloud-1
```

---

## Docker & Container Mapping

If using Docker:

| Service | Container | Image | Volume | Server | Port |
|---------|-----------|-------|--------|--------|------|
| API | `api-1` | `app:latest` | `/app` | Production VPS | 8000 (internal) |
| Inference | `inference-1` | `inference:latest` | `/models` | Production VPS | 11434 |
| Database | `db-1` | `postgres:16` | `/data/db` | Production VPS | 5432 (internal) |

**Key rule:** Never edit code directly in running containers. Edit locally, rebuild image, redeploy.

---

## Training Infrastructure Pattern

If training happens on separate hardware:

```
Local Development
    ↓ (push to git)
GitHub Repository
    ↓ (clone on GPU cloud)
GPU Cloud Instance
    ├── /data/training/        ← input datasets
    ├── /models/checkpoints/   ← intermediate checkpoints
    └── /output/               ← final models
    ↓ (download model artifact)
Local Machine / Storage
    ↓ (push to inference server)
Production VPS
    └── Model Registry / Ollama
```

---

## Decision Record

Document WHY each mapping exists:

### Decision 1: Training on Separate GPU Cloud
- **Rationale:** Production VPS is CPU-only; cannot train efficiently
- **Trade-off:** Extra latency for model upload after training
- **Alternative considered:** On-premise GPU (cost prohibitive)
- **Review date:** Quarterly

### Decision 2: Monorepo vs Multi-Repo
- **Chosen:** Multi-repo (backend, platform, community)
- **Rationale:** Each project has different deployment cadence
- **Alternative:** Monorepo (tighter coupling, simpler deployment)
- **Review date:** When adding 3rd project

### Decision 3: SSH Keys per Server vs. Single Universal Key
- **Chosen:** Separate key per server (better security)
- **Rationale:** If one key leaks, only that server is compromised
- **Alternative:** Single universal key (easier but worse security)

---

## Pre-Deployment Checklist

Before deploying:

- [ ] Verified I'm SSH'ed to correct server (check `hostname`)
- [ ] Confirmed code is latest from git (git pull or clone)
- [ ] Checked deployment target (staging vs. production)
- [ ] Reviewed recent commits
- [ ] Ran tests locally first
- [ ] Backed up current production (if modifying DB/models)
- [ ] Know rollback procedure if deployment fails

---

## Related Patterns

- **Autonomy Pre-Flight Checklist** — Use alongside this for every session
- **Infrastructure-as-Code** — If using Terraform/Ansible, document those too
- **Incident Runbook** — Keep this updated with lessons from production incidents

---

## Anti-Patterns (Don't Do)

| Anti-Pattern | Why | Better Way |
|--------------|-----|-----------|
| Store IPs in documentation | Leaks infrastructure publicly | Use aliases like `production-vps` |
| Commit SSH keys to repos | Anyone with repo access has server access | Keep in `~/.ssh/`, add to `.gitignore` |
| Have multiple "source of truth" repos | Merge conflicts, duplicated work | Single repo per logical project |
| Edit code directly on servers | Changes lost when container/VM restarts | Edit locally, version control, redeploy |
| Mixed production + staging in same codebase | Risk deploying staging code to prod | Separate branches or separate repos |

---

## Lessons Applied

| Lesson | Incident | Fix |
|--------|----------|-----|
| Infrastructure confusion | SSH'ed to staging instead of production | Created this mapping document |
| Key management | Tried using wrong SSH key for server | Added `~/.ssh/config` reference |
| Deployment mix-up | Deployed to wrong repo | Added server→repo mapping table |
| Lost changes | Edited code directly in container | Rule: Always edit locally, then push |

---

*Open source — use it wisely.*
