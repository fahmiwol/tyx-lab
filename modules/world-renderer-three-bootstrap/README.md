# World Renderer Three.js Bootstrap

Initialize a Three.js scene with isometric camera, environment lighting, post-processing, and render loop for interactive world visualization.

## Input
- container: DOM element to render into
- opts: { mode, bloom, toneMapping }

## Output
- scene, renderer, camera (Three.js objects); render loop running

## Key Features
- Orthographic isometric camera (no perspective distortion)
- IBL environment (image-based lighting, no external assets)
- Post-processing bloom (optional, opt-in for performance)
- ACES filmic tone mapping
- Soft shadows with PCF filtering
- Neon accent lights (cyan + purple)
- ResizeObserver for responsive canvas

## Example
```javascript
import { WorldLite } from './world-renderer.js';

const world = new WorldLite(document.getElementById('viewport'), {
  mode: 'view',
  bloom: true
});

world.on('paint', ({ tile, color }) => console.log('Floor painted:', tile, color));
world.loadScene(sceneJSON);
```

See LOGIC.md for architecture rationale.
