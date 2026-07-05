# Particle Avatar Engine

Client-side Canvas 2D point-cloud avatar generation. Convert photos to animated particle swarms, with luminance-aware sizing and optional elliptical masking. Includes a procedural default silhouette for onboarding.

All computation happens on the browser — no server calls, no external APIs.

## Why This Exists

User avatars need to be visually appealing and performant without network overhead. A point-cloud aesthetic works well for anonymous or abstract profiles. The engine handles:
- **Photo sampling**: Extract particles at adaptive density (controllable gap), skip dark pixels.
- **Luminance mapping**: Brighter pixels → larger/brighter dots for visual prominence.
- **Assembly animation**: Particles start scattered, animate smoothly into final positions.
- **Procedural fallback**: If no photo, generate a default silhouette (head, torso, shoulders).
- **Elliptical soft mask**: Crop to portrait shape (head+shoulders), soft edge fade to avoid harsh cutoff.

Pure math, no side effects. Works client-side with zero dependencies on Canvas or DOM rendering infrastructure.

---

*Open source — use it wisely.*
