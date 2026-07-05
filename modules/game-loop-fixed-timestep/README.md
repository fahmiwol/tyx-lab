# Game Loop with Fixed Timestep

Decoupled physics/logic and render loops for deterministic game simulation.

## Why Fixed Timestep?

Games that update physics at variable rates can produce different simulation results depending on frame rate. A fixed timestep ensures consistency: physics always runs at (e.g.) 60 Hz regardless of whether the monitor runs 30, 60, or 144 Hz.

## Features

- **Fixed update rate**: Logic/physics update at constant 1/60 Hz (configurable).
- **Variable render**: Rendering still happens at monitor refresh rate.
- **Frame skip protection**: Limits max updates per frame to prevent "spiral of death" on lag.
- **Interpolation**: Get blend factor between fixed updates for smooth rendering.
- **FPS tracking**: Built-in 60-sample rolling FPS counter.

## Usage

```javascript
import { GameLoop } from './index.js';

const loop = new GameLoop({
  fixedDt: 1 / 60,  // 60 Hz physics
  maxFrameSkip: 5,  // Max 5 updates per frame
  onUpdate: (dt) => {
    // Physics, AI, input processing
    player.update(dt);
    enemies.forEach(e => e.update(dt));
  },
  onRender: () => {
    // Draw
    renderer.render(scene, camera);
  }
});

loop.start();

// Later:
loop.stop();
```

## Interpolation

For smooth rendering between physics updates:

```javascript
const alpha = loop.getInterpolation(); // 0–1
const renderPos = {
  x: prevPos.x + (currPos.x - prevPos.x) * alpha,
  y: prevPos.y + (currPos.y - prevPos.y) * alpha
};
```

## Performance

Near-zero overhead. requestAnimationFrame drives the loop; updates happen in accumulator pattern with no extra threads or timers.

*Open source — use it wisely.*
