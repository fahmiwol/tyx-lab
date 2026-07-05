# World Renderer Three.js Bootstrap — Why This Exists

## The Problem

Initializing a 3D world renderer from scratch requires coordinating many independent concerns:

- Camera (perspective? orthographic? field of view? position?)
- Lighting (ambient? directional? shadows? IBL?)
- Post-processing (bloom? exposure? tone mapping?)
- Render loop (frame rate? delta time? event handling?)
- Responsive sizing (resize observer, DPR handling, canvas DPI)

Without a bootstrap module, each project re-implements these in slightly different ways, leading to:
- Inconsistent look & feel across projects (different tone mappings = different colors)
- Performance regressions (bloom on mobile = dropped frames; no one noticed)
- Maintenance burden (fix a lighting bug in 5 repos)

## The Solution: Bootstrap Factory

A single initialization module that:

1. **Handles camera setup** — orthographic isometric (no perspective distortion, ideal for grid worlds)
2. **Sets up environment** — IBL (image-based lighting) from a procedural room environment (no external asset)
3. **Configures lighting** — ambient + directional light + accent neon lights
4. **Applies tone mapping** — ACES filmic (cinematically graded look)
5. **Enables shadows** — PCF soft shadows for depth cues
6. **Post-processing** — bloom is opt-in (performance-conscious default)
7. **Render loop** — stable frame-independent updates via THREE.Clock
8. **Resize handling** — responsive canvas, DPR-aware pixel ratio

All configurable via `opts` but with sensible production defaults.

## Why This Shape

### Isometric camera (orthographic)
- No perspective distortion (grid-based worlds stay on-grid visually)
- Rotation with OrbitControls still feels natural (look-around at an angle)
- Easier culling (camera isn't tilting back/forth, depth order is predictable)
- Works well at any resolution (no stretching at ultrawide/mobile)

### IBL environment (RoomEnvironment)
- No external asset downloads (bundled in Three.js, procedurally generated)
- PBR materials look correct (reflections, specular highlights)
- Consistent look across all projects
- Fast on mobile (no complex lighting passes)

### ACES tone mapping
- Professional cinematography standard
- Darks stay dark, brights stay bright, midtones expand gracefully
- Consistent across color spaces (looks same on sRGB/HDR/Rec2020)

### Post-processing bloom (opt-in)
- Heavy on low-end GPU (dropped frames on mobile if always on)
- Default: OFF (IBL + tone mapping already look polished)
- If enabled: only on high-end targets (auto-detect via shader capability)

### Neon lights (hardcoded accent lights)
- Stylistic choice (cyberpunk aesthetic)
- Can be disabled by removing the `_neon()` calls
- Part of the "brand" for this renderer

## Trade-offs

✅ **Pros**
- One-line initialization: `new WorldLite(container)`
- Sensible defaults work for 90% of cases
- Opt-in complexity (bloom, custom environment, etc.)
- Renderer stays viewport-agnostic (works in iframe, modal, etc.)

❌ **Cons**
- Hardcoded tone mapping (break out into config if you need Neutral/StandardTonemapping)
- Isometric only (extend with `mode: 'perspective'` to support both)
- Limited to Three.js (not compatible with Babylon.js or PlayCanvas)

## How to Extend

### Custom environment:
```javascript
const customEnv = await new THREE.RGBELoader().loadAsync('my-hdr.hdr');
world.scene.environment = customEnv;
```

### Custom tone mapping:
```javascript
world.renderer.toneMapping = THREE.NeutralToneMapping;
world.renderer.toneMappingExposure = 1.0;
```

### Performance tuning (low-end):
```javascript
new WorldLite(container, { bloom: false }); // disable post-fx
world.renderer.setPixelRatio(1); // no upsampling
```

---

Open source — use it wisely.
