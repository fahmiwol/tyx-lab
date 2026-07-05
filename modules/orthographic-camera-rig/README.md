# Orthographic Camera Rig

Smooth-follow orthographic camera for top-down games with touch and mouse input.

## Features

- **Follow with easing**: Smooth lerp from current to target position.
- **Drag-to-pan**: Pointer drag moves camera independently of target.
- **Mouse wheel zoom**: Scroll to zoom in/out with range clamping.
- **Touch pinch-zoom**: Two-finger pinch zoom support.
- **Viewport-relative panning**: Pan amount scales with current zoom level.

## Usage

```javascript
import { OrthographicCameraRig } from './index.js';

const cam = new OrthographicCameraRig({
  width: window.innerWidth,
  height: window.innerHeight,
  zoom: 1.5,
  followSmoothing: 0.08,
  panSpeed: 1
});

cam.init();

// In game loop:
function animate() {
  cam.follow(player.x, player.y);
  cam.update(0.016); // or use real dt
  renderer.render(scene, cam.camera);
  requestAnimationFrame(animate);
}

animate();

// Change zoom programmatically:
cam.setZoom(2);
```

## Input Handling

- **Left-click drag**: Pan the camera.
- **Mouse wheel**: Zoom in/out (0.5–5× range).
- **Two-finger touch drag**: Pan.
- **Two-finger pinch**: Zoom (iOS/Android).

## Relative Movement

Use `getMoveDelta()` to get movement input relative to camera facing:

```javascript
const delta = cam.getMoveDelta('up'); // { x: 0, y: 1 }
player.x += delta.x * speed;
player.y += delta.y * speed;
```

*Open source — use it wisely.*
