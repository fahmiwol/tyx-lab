# Three.js Scene Bootstrap

One-liner Three.js scene setup with lights, fog, shadows, and resize handling.

## Features

- **Minimal config**: Declarative lights, fog, and renderer setup.
- **Light factory**: Ambient, directional (with shadows), hemisphere, point lights.
- **Responsive**: Auto-resizes canvas on window resize.
- **Shadow support**: PCF soft shadows, configurable shadow maps per light.
- **Extensible**: Return to hook custom initialization.

## Usage

```javascript
import { ThreeSceneBootstrap } from './index.js';
import { OrthographicCamera } from 'three';

const bootstrap = new ThreeSceneBootstrap('canvas', {
  clearColor: 0x87CEEB,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
  fog: {
    type: 'exp2',
    color: 0x87CEEB,
    density: 0.006
  },
  lights: [
    {
      type: 'ambient',
      color: 0xfff4e0,
      intensity: 0.6
    },
    {
      type: 'directional',
      color: 0xfff4c0,
      intensity: 1.2,
      position: [10, 20, 10],
      shadows: true,
      shadowBox: {
        left: -30, right: 30,
        top: 30, bottom: -30
      }
    },
    {
      type: 'hemisphere',
      skyColor: 0x87CEEB,
      groundColor: 0xA8D5A2,
      intensity: 0.4
    }
  ]
});

bootstrap.init();

const camera = new OrthographicCamera(-10, 10, 10, -10, 0.1, 1000);
camera.position.set(0, 0, 20);
bootstrap.setCamera(camera);

// Game loop
function animate() {
  const dt = bootstrap.getDelta();
  // Update game state...
  bootstrap.render();
  requestAnimationFrame(animate);
}

animate();
```

## Light Types

- **ambient**: Uniform fill light. No shadows.
- **directional**: Sun/moon. Supports shadows, shadow box customization.
- **hemisphere**: Sky/ground gradient. No shadows.
- **point**: Spherical light. Supports shadows, distance falloff.

## Performance

No per-frame overhead. Scene setup is one-time cost. Light/fog parameters can be animated in update loop.

*Open source — use it wisely.*
