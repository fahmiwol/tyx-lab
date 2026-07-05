# Day Night Cycle

Procedural 24-hour lighting and environment cycle for Three.js scenes.

## Features

- **Keyframe interpolation**: Smoothly transitions directional light, ambient light, fog, and background color through 11 time-of-day keyframes.
- **Phase detection**: Automatically returns current phase (dawn/day/dusk/night) for AI decision-making or UI state.
- **Wall-clock time**: Uses local time with configurable timezone offset (default UTC+7).
- **Fast mode**: 60× time acceleration for demos/testing.
- **Manual override**: Force a specific hour for consistent testing or cinematic sequences.

## Usage

```javascript
import { DayNightCycle } from './index.js';

const renderer = {
  dirLight: scene.getObjectByName('sun'),
  ambientLight: scene.getObjectByName('ambient'),
  scene,
  renderer: webglRenderer
};

const cycle = new DayNightCycle(renderer);

// In your game loop:
function animate() {
  const dt = clock.getDelta();
  cycle.update(dt);
  renderer.renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Override time for testing:
cycle.forceHour(14); // Force 2 PM
cycle.forceHour(null); // Resume wall clock

// Use phase for logic:
if (cycle.getPhase() === 'night') {
  // Turn on streetlights, close shops, etc.
}
```

## Keyframe Structure

Each keyframe defines hour-of-day and RGBA lighting values. Edit `KF` array in source to customize colors/intensities for your aesthetic.

## Timezone

Default is UTC+7 (Jakarta). Change with:
```javascript
cycle.setTimezone(-5); // UTC-5 (EST)
```

## Performance

No GPU overhead — purely JS number crunching and material updates. One `update()` call per frame, no allocations in hot path.

*Open source — use it wisely.*
