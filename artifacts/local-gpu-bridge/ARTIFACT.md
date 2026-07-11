# Local GPU Bridge — borrow the owner's consumer GPU for a self-hosted AI (inference, image-gen, training)

> Method distilled from a real production system: an always-on CPU VPS that borrows a
> consumer RTX laptop over a reverse-SSH tunnel — text inference, image generation, and
> (design) LoRA training. Every pitfall below cost real hours.


> Origin: Fahmi Ghani / Tiranyx — MiganCore, 2026-07 (F-175/F-179/F-180). Founder insight: "Chrome and Steam
> use my GPU — my VPS should too." Built, broken, and hardened in production the same
> day. Reusable for any self-hosted brain (and shippable to end users).

## Architecture (one paragraph)
The always-on server stays CPU-only (cheap, reliable). The consumer machine runs a local
inference server (Ollama or equivalent) and opens a **reverse SSH tunnel OUT** to the
server — outbound, so home NAT/dynamic IP never matters. The server probes the tunneled
endpoint (cached ~60s) and routes **heavy background work** to it when alive, its local
CPU otherwise. Chat/interactive streaming NEVER rides the bridge (the laptop can vanish
mid-stream). A desktop status app keeps the non-technical owner oriented.

## The wiring (exact, with the pitfalls that cost hours)
1. **Laptop**: install Ollama, pull the heavy model. Ollama binds 127.0.0.1:11434.
2. **Server sshd**: `GatewayPorts clientspecified` in sshd_config. ⚠️ Backup + `sshd -t`
   BEFORE restart (a bad config locks you out). `systemctl reload` may NOT apply it —
   verify with `sshd -T | grep -i gatewayports`; restart if needed (established sessions survive).
3. **Tunnel** (laptop → server):
   `ssh -N -R <BIND_IP>:11500:127.0.0.1:11434 -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes user@server`
   - ⚠️ **BIND_IP must be the COMPOSE NETWORK GATEWAY, not textbook 172.17.0.1.** Boxes
     have custom docker subnets. Get it: `docker inspect <container> --format '{{range .NetworkSettings.Networks}}{{.Gateway}}{{end}}'`.
   - sshd refuses to bind to an IP that doesn't exist on the host → "remote port forwarding failed".
4. **Firewall**: ⚠️ UFW/iptables usually BLOCK container→host connections. Scope the rule
   to the container subnet only (never expose the tunnel to the internet):
   `ufw allow from <SUBNET>/24 to any port 11500 proto tcp`
5. **Server-side resolver** (`gpu_bridge` module): `heavy_ollama_url()` — health-probe the
   GPU endpoint (`/api/version`, 2s timeout, cache 60s so probes never add per-call latency)
   → GPU URL when alive, local URL otherwise. Flag-gated, default off.
6. **Persistence** (Windows laptop): a reconnect-loop `.ps1` (`while($true){ssh ...; sleep 20}`)
   launched hidden by a `.vbs` in the user's **Startup folder** (schtasks needs admin; Startup doesn't).

## ⚠️ THE NON-NEGOTIABLE: antifragile failover
The first live run failed beautifully: laptop RAM was full → model init `std::bad_alloc`
→ HTTP 500 **after 26s** → the extraction was silently LOST. A naive bridge REDUCES
reliability. The rule:
> **Every GPU call wraps in: try GPU → on ANY failure, `mark_failed()` (kill the cached
> alive-state for the probe TTL) → retry the SAME request on local CPU.**
Proven log chain: `alive=True → 500 → marked_failed → fallback_retry → work stored ✓`.
The bridge can then only ever ADD speed. Without this, don't ship it.

## What rides the bridge vs what never does
- ✅ Background/deferrable: KG extraction, summarization, state extraction, teacher
  generation, distillation, batch eval, embedding backfills.
- ❌ Interactive streaming (user-facing chat), anything mid-conversation, anything
  whose failure isn't retried.

## Sizing reality (consumer GPUs)
A 7B q4 model ≈ 4.7GB weights; a 6GB-VRAM laptop splits layers to system RAM — if the
owner's RAM is busy (browser, editor) init can OOM → that's WHY failover is mandatory,
not an edge case. Probe cadence 60s means the GPU auto-joins when the machine frees up.

## Desktop status app (owner-facing; shippable to end users)
Non-technical owners need to SEE it. Minimal robust pattern (zero dependencies):
a PowerShell `HttpListener` on 127.0.0.1 serving one HTML page + `/status` JSON —
ALL checks server-side (GPU via nvidia-smi, local Ollama, tunnel = ssh process match,
server /health) so there are no CORS issues; auto-refresh; a Restart-Tunnel button;
launched via `msedge --app=` for an app-window feel; desktop shortcut. ~150 lines total.

## v2 — shipping it: restricted tunnel user + one-script installer (proven E2E in production)
Never ship the server's root/personal SSH key. Create a TUNNEL-ONLY user:
```
useradd -r -m -s /usr/sbin/nologin bridge-user
# sshd_config (append, then `sshd -t` + RELOAD not restart):
Match User bridge-user
    AllowTcpForwarding remote     # reverse-forward ONLY
    PermitOpen none               # no local-forward pivoting
    PermitTTY no
    X11Forwarding no
    AllowAgentForwarding no
    PermitListen 11500 11501 ...  # exactly the bridge ports
```
Verify with `sshd -T -C user=bridge-user`; test NEGATIVE (shell → "account not available",
`-L` forward → dead) before trusting it. Installer trick: a successful auth against a
nologin account prints "This account is currently not available" — that exact message IS
the "key registered" signal; "Permission denied" means not registered yet.
One-script installer steps (idempotent, backup-first): check GPU → install runtime →
pull model → per-install ed25519 keypair → registration check (above) → write tunnel
loop + monitor → Startup entry → start + verify.
⚠️ Windows `.ps1` trap: save UTF-8 **WITH BOM** and avoid em-dashes — PowerShell 5.1 reads
BOM-less files as ANSI and byte 0x94 becomes a closing smart-quote → phantom parse errors.
⚠️ sshd holds a killed tunnel's port binds for minutes; a reconnect loop with
`ExitOnForwardFailure=yes` looks "broken" until the hold expires — wait 1-2 retry cycles,
and don't run manual test tunnels that steal the bind from the loop.

## v2 — beyond text: local IMAGE-GEN over the same tunnel (proven E2E in production)
One ssh carries multiple `-R` forwards — add a second service without a second tunnel:
`-R <GW>:11500:127.0.0.1:11434 -R <GW>:11502:127.0.0.1:<image-port>`.
Backend choice (researched + measured, Jul 2026): **`stable-diffusion.cpp sd-server`** —
C/C++ (no Python/torch), GGUF-quantized, OpenAI-compatible `/v1/images/generations`
(base64 in → save PNGs into a dir your web server already serves → return public URLs
shaped like your cloud provider's, so the tool contract never changes). SD1.5 Q8 GGUF =
1.7GB VRAM → coexists with a 7B LLM on a 6GB card. Fooocus/A1111 rejected (maintenance
mode, torch-resident, no clean unload).
Working 6GB recipe: `--fa --vae-tiling --max-vram 0.8 --stream-layers`
(+ `--backend vae=cpu` ONLY when host memory is squeezed — 43s vs 3s decode).
Same antifragile rule: probe (cache 60s) → try local → ANY failure → mark_failed →
fall through to the cloud generator. Kill-test both directions before claiming done.

## v2 — the trap that looks impossible: cudaMalloc OOM with EMPTY VRAM (Windows/WDDM)
On Windows, GPU allocations also charge the system **commit limit** (RAM + pagefile).
If commit is nearly full (many heavy processes, or pagefile can't grow because the DISK
is full), `cudaMalloc` fails while `nvidia-smi` shows 0 MiB used. Diagnose with
`Committed Bytes` vs `Commit Limit` perf counters — NOT nvidia-smi. Fix order: free disk
(pagefile headroom) → close memory hogs → smaller quant / segmented execution.
**Invariant: check commit before any heavy GPU work on a consumer Windows box.**

## Future evolution (recorded intent)
- Same bridge pattern extends further: local files/inventory ingest, local apps via MCP,
  and **local TRAINING runs on the owner's GPU** — same tunnel, same failover doctrine:
  server prepares dataset → laptop runs LoRA/distill (checkpoint every N steps, Salad-style,
  so a vanishing laptop only loses one increment) → server pulls adapter + runs eval gate.
  GPU rent becomes the fallback, not the default.
- Transport upgrade path when shipping to MANY users: WireGuard/Tailscale-style mesh or
  FRP instead of raw reverse-SSH (per-user port allocation stops scaling past a handful).
