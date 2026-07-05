<div align="center">

# tyx-lab

**Tiranyx Open Module Library**

Atomic modules & artifacts extracted from real, running systems.
Not full apps. Not theory. Small, documented building blocks you stitch together yourself.

**Open source — use it wisely.**

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![atoms](https://img.shields.io/badge/atoms-92-6366f1) ![status](https://img.shields.io/badge/status-living-brightgreen)

[**Modules (55)**](modules/) · [**Artifacts (37)**](artifacts/) · [**Recipes**](recipes/) · [**Contribute**](CONTRIBUTING.md)

</div>

---

## What is this?

Every atom here was pulled from a real system and stripped to its smallest reusable unit.
The rule: **each atom does exactly one thing.** You stitch them together your way.
Made for people who don't want to dig through a whole codebase — take the piece, read the
reasoning, use it.

- **`modules/`** — atomic **code** (importable, one job): `README.md` + `LOGIC.md` + `USAGE.md` + `module.json` + `src/`
- **`artifacts/`** — atomic **non-code** (prompt / template / formula / method / playbook / finding): a self-contained `ARTIFACT.md` + `artifact.json`
- **`recipes/`** — how to stitch several atoms into a use case

Read each atom's `LOGIC.md` (or the artifact's *Why* section) first — that is where the judgment lives.

---

## 📦 Catalog — 92 atoms

> `55` modules · `37` artifacts. Full machine-readable list in [`index.json`](index.json).

### 🧩 Modules — atomic code (55)

#### AI & Agents (9)

- **[Haal: User-State Conditioning](modules/haal-user-state-conditioning)** — User's current state (brand_haal, audience_haal, temporal_haal, spatial_haal) is not metadata—it's first-class computation input. Conditions generation ...
- **[Hierarchical Semantic Layers (Zahir/Batin/Hadd/Mathla)](modules/semantic-layers-decompose)** — Decomposes text into simultaneous valid semantic layers: surface (Zahir), inner intent (Batin), boundaries (Hadd), ultimate purpose (Mathla). Enables mu...
- **[I'jaz Multi-Scale Coherence Evaluator](modules/ijaz-coherence-quality)** — Evaluates creative output across 6 scales: word, element, piece, campaign, brand, audience. Harmonic mean; weakest link drags result.
- **[Multi-Provider AI Router](modules/ai-router-fallback)** — Fallback AI content provider with priority: Groq (free) → Gemini (free) → Ollama (local) → Anthropic. Handles timeouts, fallback, and unified response f...
- **[Self-Refining Agent Loop (Tafakkur Pattern)](modules/agent-self-refine-loop)** — Dual-agent criticism loop: innovator generates → critic evaluates across multiple modes → refine or accept. Prevents single-pass mediocrity; compound qu...
- **[Server-Sent Event Chat Stream Parser](modules/sse-chat-stream-parser)** — Parse SSE frames from LLM/chat streaming endpoints. Tolerant of multiple JSON payload formats (token/delta/content/text variants), plain text fallback, ...
- **[Tile Grid Coordinator](modules/tile-grid-coordinator)** — Pure grid coordinate conversion utility for top-down and isometric tile maps (RPG/Gather-style). Square tiles, screen offset support, Manhattan distance...
- **[Tool Registry & Dispatch Pattern](modules/tool-registry-dispatch)** — Centralized registry of available tools/skills. Agents query registry to discover available actions, validate parameters, execute with permission gates,...
- **[TTS Provider Wrapper](modules/tts-provider-wrapper)** — Abstraction layer for TTS services (OpenAI, Google Cloud, Azure) with caching, rate limiting, and streaming output. Normalizes provider APIs into unifie...

#### Infrastructure (16)

- **[AES-256-GCM Secret Encrypt/Decrypt](modules/aes-256-gcm-secret)** — Encrypt/decrypt sensitive data (API keys, tokens, secrets) with AES-256-GCM. Output: base64(iv || authTag || ciphertext). Key derived from env var via S...
- **[Audio Chunk Streamer](modules/audio-chunk-streamer)** — HTTP streaming for large audio files with chunked transfer encoding. Supports range requests, pause/resume, and adaptive bitrate.
- **[BullMQ Job Enqueuer](modules/bullmq-job-enqueuer)** — Wrapper for BullMQ queue with exponential backoff, retry policy, and auto-cleanup. Standardizes job enqueueing for e-commerce workflows (scrape, process...
- **[Environment Config Schema](modules/env-config-schema)** — Pydantic-based environment variable configuration with type coercion, validation, and defaults. Single source of truth for app settings across all modules.
- **[Exponential Backoff Queue](modules/exponential-backoff-queue)** — BullMQ queue configuration with exponential backoff retry strategy. Prevents thundering herd, includes auto-cleanup, and supports preset strategies (def...
- **[JWT Auth Cookies](modules/jwt-auth-cookies)** — JWT-based authentication with secure httpOnly cookies, refresh token rotation, and access token expiry. Handles auth state across SPA + API.
- **[JWT Token Helper](modules/jwt-token-helper)** — Create and validate JWT access tokens with configurable TTL. Handles token generation, validation, claim extraction, and error cases for FastAPI services.
- **[Meta Webhook Verifier](modules/webhook-meta-verify)** — Verify Meta Cloud API webhook challenge-response and HMAC-SHA256 signatures. Validates webhook authenticity and prevents spoofing for WhatsApp/Messenger...
- **[Password Hashing with Scrypt](modules/password-scrypt-hash)** — Hash and verify passwords using scrypt (Node built-in crypto). Format: hexSalt:hexKey. No native dependencies. Timing-safe comparison.
- **[Prisma Lifecycle Service](modules/prisma-lifecycle-service)** — NestJS injectable Prisma service with automatic connection management. Implements OnModuleInit/OnModuleDestroy for graceful startup and shutdown; includ...
- **[Redis Queue Wrapper](modules/redis-queue-wrapper)** — Factory pattern for Redis connection pooling and RQ queue management. Provides singleton Redis connection and named queues for reliable task enqueueing.
- **[Relative Timestamp Formatter](modules/relative-timestamp-formatter)** — Format dates as human-readable relative timestamps (5m ago, 2h ago) and locale-aware time strings. Zero dependencies; works in browsers and Node.
- **[Safe localStorage Wrapper](modules/safe-localstorage-wrapper)** — Browser localStorage with graceful fallback on quota exceeded or unavailability. JSON serialization, prefixed keys, silent error handling, returns defau...
- **[Server Auth Token Cache](modules/server-auth-token-cache)** — Self-healing JWT token cache for backend services. Auto-refresh when expiry approaches (60s buffer). Graceful fallback to static token. Extracts exp cla...
- **[Webhook Dispatcher](modules/webhook-dispatcher)** — Fan-out webhook dispatcher for multiple integrations with configurable timeout and error handling. Posts events to active endpoints, logs responses for ...
- **[Webhook Meta Header Validator](modules/webhook-meta-header-validator)** — Validate Meta (WhatsApp/Facebook/Instagram) webhook signature using HMAC-SHA256. Prevents replay/spoofing attacks.

#### Business & Fintech (12)

- **[Append-Only Audit Log](modules/audit-log-pattern)** — Immutable append-only audit trail for fintech/compliance. Dual-track user + admin logs with soft-fail, denormalization, and request metadata capture.
- **[Command Intent Router](modules/command-intent-router)** — Parse text commands and route to intent handlers. Supports regex patterns, fuzzy matching, and parameter extraction.
- **[Currency Formatter & Conversion](modules/currency-formatter)** — Format and convert between IDR and USD. Rate stored in DB or env, with fallback. Display helpers for prices with/without conversions.
- **[Double-Entry Ledger](modules/double-entry-ledger)** — Immutable transaction ledger for fintech: P2P transfers, conversions with fees, mint/reward/withdraw operations. Includes denormalized balances and coin...
- **[Idempotent Payment Processing](modules/idempotent-payment-processing)** — Prevent duplicate transactions from webhook retries using deterministic idempotency keys. Guards against double-crediting users.
- **[Intent Pattern Matcher](modules/intent-pattern-matcher)** — Static rule-based intent classifier for domain language (Indonesian commerce: stock check, production logging, sales). Avoids LLM calls by pattern match...
- **[Message Pipeline Router](modules/message-pipeline-router)** — Inbound webhook message handler with intent parsing and action dispatch. Normalizes multi-channel input (WhatsApp, Telegram) → parses intent via rules o...
- **[Minimal Session Cookie Auth](modules/minimal-session-cookie)** — HMAC-SHA256 signed session tokens (no external auth library). Payload: base64(json).signature. Stores in httpOnly cookie with 14-day TTL.
- **[Nodemailer Email Template](modules/nodemailer-email-template)** — Email dispatch via nodemailer with SMTP relay. Graceful fallback if SMTP unconfigured. Built-in HTML templates for common SaaS flows (purchase, reset, i...
- **[Phone Normalization](modules/phone-normalization)** — Normalize and validate phone numbers for Southeast Asia (Indonesia 62). Handles leading zeros, country codes, and formats for WhatsApp/messaging APIs.
- **[Social Post Auto-Scheduler](modules/social-post-scheduler)** — Background worker (60s interval) that publishes scheduled social posts when scheduled_at <= now(). Supports batch processing, transactional updates, and...
- **[Tiered Quota & Rate-Limit Resolver](modules/tiered-quota-resolver)** — Check daily usage quota across tiers (admin/pro/free/anon). Supports IP-based hashing for anonymous users, cookie-based auth (admin/user tokens), and co...

#### Ops & Methodology (5)

- **[Brute Force Login Guard](modules/brute-force-login-guard)** — Rate limiter for login attempts using IP+identifier tracking. Prevents credential stuffing with configurable window (15min default).
- **[CSRF Security Guard](modules/csrf-security-guard)** — CSRF token generation, validation, and session security hardening with HttpOnly + Secure + SameSite cookies.
- **[Database Sequential Number Generator](modules/db-numseq-generator)** — Generate sequential document/invoice numbers with prefix, period (YYYYMM), and auto-increment. Useful for invoices, orders, leads.
- **[Pagination Helper](modules/pagination-helper)** — Compute pagination windows (page, total, offset, page links) for lists and APIs.
- **[Rupiah Currency & Text Formatter](modules/rupiah-formatter)** — Format numbers as IDR currency with short notation (M/jt/rb), and convert to Indonesian words (terbilang).

#### CRM (1)

- **[Sales Pipeline Stage Machine](modules/sale-pipeline-stages)** — Sales pipeline stage machine with SLA tracking and terminal state detection.

#### Video & Motion (1)

- **[Ken Burns FFmpeg Renderer](modules/ken-burns-ffmpeg-renderer)** — Command-line video generation from still images using Ken Burns zoom-pan effect. Chains ffmpeg with zoompan filter for cinematic image→video conversion....

#### 3D & Graphics (10)

- **[A* Tilemap Pathfinder](modules/astar-tilemap-pathfinder)** — Classic A* pathfinding algorithm for orthogonal tile grids. Supports 4 or 8-direction movement, configurable heuristics (Manhattan/Euclidean), and itera...
- **[Cinematic Camera Controller](modules/cinematic-camera-controller)** — Three.js OrthographicCamera controller with preset cinematic animations (building pan, agent zoom, orbit, room sweep). Smooth easing, auto-return of man...
- **[Day Night Cycle](modules/day-night-cycle)** — 24-hour environment cycle for Three.js scenes. Interpolates directional light, ambient light, fog, and clear color through keyframe-defined phases (dawn...
- **[Game Loop with Fixed Timestep](modules/game-loop-fixed-timestep)** — requestAnimationFrame game loop with decoupled fixed-rate update (physics/logic) and variable-rate render. Includes frame skip limits, FPS tracking, and...
- **[Image with Fallback Component](modules/image-with-fallback)** — React component for images with inline fallback SVG on load error. Preserves dims and className. Useful for user-generated content, avatars, product pho...
- **[Orthographic Camera Rig](modules/orthographic-camera-rig)** — Three.js orthographic camera controller with smooth follow, drag-to-pan, mouse wheel zoom, and touch pinch-zoom. Ideal for top-down/isometric games. Han...
- **[Particle Avatar Engine](modules/particle-avatar-engine)** — Client-side Canvas 2D point-cloud avatar generator. Converts photos to dot patterns with luminance-based sizing, assembly/drift animation, and default s...
- **[Raycaster Object Picker](modules/raycaster-object-picker)** — Three.js mouse/touch-to-3D object picking via raycasting. Click/tap to select objects, optional hover highlighting with customizable color. Event-driven...
- **[Sprite Sheet Animator](modules/sprite-sheet-animator)** — Canvas 2D sprite sheet animation player. Manages frame sequences, playback speed, looping, ping-pong, and draw positioning. Ideal for character animatio...
- **[Three.js Scene Bootstrap](modules/three-scene-bootstrap)** — Minimal WebGL scene initialization with renderer, scene, configurable lights, fog, and resize handling. Factory pattern for lights (ambient/directional/...

#### Research (1)

- **[Knowledge Graph from Wikilinks](modules/knowledge-graph-wikilinks)** — Pure TypeScript module to extract and build directed graphs from markdown notes using [[wikilink]] syntax. Backlink indexing, graph visualization data, ...


### 📜 Artifacts — atomic non-code (37)

#### AI & Agents (14)

- **[Agent Persona Router](artifacts/agent-persona-router)** — `method` — Dispatch tasks to specialized agent personas with isolated memory.
- **[Asbabun Nuzul: Grounded Brief Pattern](artifacts/asbabun-nuzul-grounded-brief)** — `playbook` — Every creative output grounded in specific trigger (Asbabun Nuzul). Extract: trigger event, specific audience, concrete moment, real tension. Generic br...
- **[Continuous Learning via Reflective Loop (Tafakkur)](artifacts/continuous-learning-tafakkur)** — `framework` — Self-evolution without catastrophic forgetting: frozen core + dynamic LoRA adapters + episodic memory (error traces) + semantic memory (learned patterns...
- **[Creative Brief Intake Framework (IHOS-Aligned)](artifacts/brief-intake-framework)** — `template` — Structured intake for creative briefs: capture all 4 semantic layers (Zahir/Batin/Hadd/Mathla), user state (Haal), grounding context (Asbabun Nuzul), an...
- **[Embedding / RAG Chunking](artifacts/embedding-rag-chunking)** — `method` — Split documents semantically for RAG with hierarchical metadata.
- **[Haal Conditioning: User State as Computation](artifacts/haal-conditioning-pattern)** — `framework` — User's Haal (current state/condition) is not metadata passed to LLM—it IS the computation. Same task generates radically different output for different ...
- **[IHOS Epistemology Framework](artifacts/ihos-epistemology-framework)** — `framework` — Islamic Epistemology (Ilmu Jariyah, Hifdz, Akses Umat, Sistem) as applied to AI system design. Translates 1400-year-old validation principles into moder...
- **[I'jaz Multi-Scale Coherence Quality Gate](artifacts/ijaz-quality-coherence-gate)** — `formula` — Quality is not 'is it good?' but 'does it hold at every scale simultaneously?' I'jaz principle: output must be coherent at word/element/piece/campaign/b...
- **[LLM Provider Fallback Router](artifacts/llm-provider-fallback)** — `method` — Route LLM calls across multiple providers with automatic fallback on error or rate limit.
- **[Multi-Provider Token & Cost Estimator](artifacts/token-cost-estimator)** — `method` — Estimate token counts and cost across LLM providers with caching.
- **[Prompt Chain Orchestration](artifacts/prompt-chain-orchestration)** — `method` — Compose multi-step LLM workflows with loops and conditionals.
- **[ReAct Agent Loop (Reason + Act + Observe)](artifacts/react-agent-loop-pattern)** — `playbook` — Reasoning + Action + Observation loop. Agent generates Thought → Action (tool call) → Observation (result) → loops until sufficient info → Final Answer....
- **[Tool Registry & Discovery Pattern](artifacts/tool-registry-pattern)** — `playbook` — Multi-agent systems need a single source of truth for available tools/skills. Registry pattern enables discovery, validation, permission checks, and usa...
- **[Visual Workflow Node Schema](artifacts/workflow-node-schema)** — `framework` — A visual-orchestration node contract and execution engine for chaining tools and LLMs.

#### Infrastructure (9)

- **[exFAT Windows Fix for Next.js / Webpack](artifacts/exfat-windows-fix)** — `finding` — Fix EISDIR readlink crashes when building Next.js/Webpack projects on a Windows exFAT drive by shimming fs.readlink before webpack captures it.
- **[Frontend Deploy Bash Pattern](artifacts/frontend-deploy-bash-pattern)** — `template` — Parameterized shell script for zero-downtime frontend deployment: git pull, npm build, PM2 restart, rsync sync, health check verification.
- **[Git Workflow — Windows + Private GitHub Repo](artifacts/git-workflow-windows)** — `playbook` — Lean git setup and recovery flow tuned for Windows + a private GitHub repo: PAT auth, conventional commits, Windows path pitfalls, and safe undo.
- **[LLM JSON Repair & Fallback](artifacts/json-repair-fallback)** — `method` — Recover valid JSON from malformed LLM output via repair and partial extraction.
- **[Meta Pixel + Conversions API with Dedup](artifacts/meta-capi-dedup)** — `playbook` — Wire Meta Pixel + server-side Conversions API with browser<->server event_id dedup for high Event Match Quality, no CAPI Gateway needed.
- **[Next.js + Three.js Deploy & WebGL Debugging Gotchas](artifacts/nextjs-webgl-deploy-gotchas)** — `finding` — Reusable failure modes when deploying a Next.js app with a Three.js/WebGL scene: stale-serve traps and silent GLB/meshopt render failures, with fixes.
- **[Next.js Subdomain Multi-Tenant Routing](artifacts/nextjs-subdomain-multitenant)** — `playbook` — Subdomain -> tenant rewriting in Next.js App Router via middleware, with static/verification-file exemptions and localhost fallback.
- **[Nginx Security Headers Pattern](artifacts/nginx-security-headers-pattern)** — `template` — Production nginx config snippet for security headers, TLS hardening, compression, cache control, and PWA/Service Worker handling.
- **[Resilient Cross-Provider Tool Calling](artifacts/tool-calling-resilient)** — `method` — Cross-provider tool-calling schema with validation and retry.

#### Business & Fintech (4)

- **[Finite State Machine for Workflows](artifacts/finite-state-machine-workflows)** — `framework` — Model complex processes (payments, withdrawals, approvals) with explicit states, guarded transitions, side effects, and audit trails. Prevents invalid s...
- **[Money Math in Minor Units](artifacts/money-math-minor-units)** — `formula` — Prevent floating-point rounding errors in financial calculations by working entirely in integer minor units (cents, satoshis). Includes conversion, fee ...
- **[Reward & Gamification System](artifacts/reward-gamification-system)** — `template` — Non-monetary reward system with achievement unlocks, leaderboards, and engagement incentives. Points drive user retention without fintech regulatory bur...
- **[Tiered Pricing & Package Resolution](artifacts/tiered-pricing-package-resolution)** — `formula` — Dynamic pricing models: fixed packages with bonuses, quantity-based tiers, customer segments, and time-based proration for subscriptions.

#### Ops & Methodology (6)

- **[Disciplined Execution — the 8-gate loop](artifacts/disciplined-execution)** — `method` — A test-driven execution discipline: decompose into epics/episodes and gate every episode through 8 validation steps so regressions never ship.
- **[Facebook Business Domain Verification (dual-method)](artifacts/facebook-domain-verification)** — `playbook` — Verify a domain in Meta Business Manager via BOTH meta-tag and HTML-file methods, with a Next.js middleware exemption so verification files serve verbatim.
- **[PM2 Ecosystem Config with Feature Flags](artifacts/pm2-feature-flag-ecosystem-config)** — `template` — Multi-process PM2 ecosystem.config.js with environment-based feature flags, cron health checks, mixed interpreter support (bash, node, serve), and A/B t...
- **[Repository Cartography & Agent Handoff](artifacts/repo-cartography-handoff)** — `method` — Build a maintainable documentation map for a large repo: tiered doc list, folder roles, runtime flow, conflict table, honest coverage, and a living hand...
- **[Shopee Open Platform — Partner App Integration](artifacts/shopee-open-platform-integration)** — `playbook` — Build a Shopee Partner App: one developer account onboarding many seller shops via OAuth, HMAC-SHA256 signing, token lifecycle, minimum-scope and review...
- **[Shopee Storefront to Your DB — decision tree](artifacts/shopee-data-import)** — `playbook` — Pragmatic ranked paths to get product data out of a Shopee storefront (CSV export, Meta Catalog API, paid scraper, manual seed) with what fails and why.

#### CRM (1)

- **[Lead Source & Bounce Reason Taxonomy](artifacts/lead-source-classifier)** — `framework` — Extensible enum of lead sources (WhatsApp, Referral, Cold Call, etc.) and bounce reasons (price, budget, competitor, etc.). Use for CRM pipeline classif...

#### Video & Motion (1)

- **[Storyboard Prompt Variants](artifacts/storyboard-prompt-variants)** — `template` — Generate multi-genre video-generation prompts (ads, cinematic, generic) from a storyboard.

#### Research (2)

- **[Epistemology Reasoning Framework](artifacts/epistemology-reasoning-framework)** — `framework` — Structured reasoning with explicit uncertainty and sourcing.
- **[Selective Adoption Doctrine](artifacts/selective-adoption-doctrine)** — `method` — When studying an external reference (library, competitor, sample repo), adopt the transferable PATTERN only — never import the whole framework.


---

## This is a living library

New atoms land here continuously. Every agent and collaborator that builds something
reusable extracts it back into this repo — that contract is written in [AGENTS.md](AGENTS.md).
These atoms are the open layer of a larger ecosystem (Mighanworld, Migancore, Ixonomic);
this repo is the part given freely.

## Contribute

Found something useful? Leave a ⭐. Want to add an atom? **One PR = one atom**, and the
*why* is mandatory. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

<div align="center">

Built and maintained by Fahmi Ghani · Tiranyx · MIT License

*Real tools from a real builder. Use them freely, use them wisely.*

</div>