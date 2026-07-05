# Next.js + Three.js Deploy & WebGL Debugging Gotchas

**Kind:** finding · **Category:** infra · **Status:** stable

A checklist of stacked failure modes seen shipping a Next.js app that renders a
Three.js/WebGL scene: several independent causes can produce the *same* "blank screen"
symptom, each hiding the next. These are the generic, reusable ones (infrastructure
specifics removed).

---

## Why this exists

One "blank avatar" symptom had multiple stacked root causes — a stale serve layer AND a
silent GLB decode failure — and each fix only revealed the next. Turning them into a
flat checklist stops a one-day debugging spiral. None of this is app-specific; it
applies to any Next.js + `@react-three/fiber` deployment.

## Rule 0 — prove the new build is actually served

After every deploy, assert the live JS chunk hash **changed**. If it didn''t, the new
build is not being served — stop editing code and fix the serve layer.

```bash
curl -s https://your-app/route | grep -oE 'page-[a-f0-9]+\.js'
# compare against the freshly built chunk filenames on the server
```

## Stale-serve traps (a deploy that "does nothing")

1. **`output: "standalone"` + `next start`.** `next start` does not work with
   standalone output — it silently serves a frozen `.next`, so the chunk hash never
   changes. Either drop `output: standalone`, or run `node .next/standalone/server.js`.
2. **Inherited reverse-proxy cache.** A global nginx `proxy_cache` directive is
   inherited by every vhost and can cache HTML for a year. Add `proxy_cache off;` in
   the app''s `location` block, purge the cache dir, and reload.
3. **Static prerender of an auth page.** A `"use client"` page with no data fetch gets
   statically prerendered with a long `s-maxage`. Force it dynamic from a Server
   Component: `export const dynamic = "force-dynamic"` in `app/layout.tsx` (you cannot
   export route config from a `"use client"` page).

## WebGL / Three.js render failures

- **A throw inside `<Canvas>` is NOT caught by an outer React error boundary** —
  `@react-three/fiber` runs its own reconciler. A failed `useGLTF` white-screens the
  whole app. Load GLBs **manually** (`new GLTFLoader()` in `useEffect`, error handled
  in the callback) so a bad asset resolves to `null` instead of throwing at render.
  Keep a dedicated Canvas error boundary as a backstop.
- **A meshopt-compressed GLB needs `setMeshoptDecoder`** — the #1 silent killer.
  Without it, `GLTFLoader` decodes vertex positions to **NaN**: overlay lines render
  but the mesh is invisible. Inspect `extensionsRequired` and register every decoder
  (`MeshoptDecoder`, and `KTX2Loader` for KTX2 textures) before loading.
- **Do not re-encode an asset to dodge a decoder** — dequantizing a meshopt+quantized
  GLB can itself produce NaN. Add the correct decoder instead.
- **Guard non-finite bounds** — if computed bounding values are non-finite, bail to
  empty rather than rendering a NaN point cloud.

---

*Open source — use it wisely.*