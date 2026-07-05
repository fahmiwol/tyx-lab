# Sprite Sheet Animator

Canvas 2D sprite sheet animation player with configurable playback modes.

## Features

- **Frame-based playback**: Define animations as frame index sequences.
- **Configurable speed**: FPS per animation.
- **Loop/ping-pong**: Standard loop or reversing ping-pong playback.
- **Pause/resume**: Mid-animation control.
- **Callbacks**: Trigger code on animation completion.
- **Scale and flip**: Draw with arbitrary scale for flipping.

## Usage

```javascript
import { SpriteSheetAnimator } from './index.js';

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const spriteSheet = new Image();
spriteSheet.src = 'char.png';

const animator = new SpriteSheetAnimator(ctx, {
  image: spriteSheet,
  frameWidth: 64,
  frameHeight: 64,
  cols: 4,     // 4 frames per row
  rows: 3      // 3 rows total (12 frames)
});

// Define animations
animator.defineAnimation('idle', {
  frameIndices: [0, 1, 2, 1],  // Frames 0, 1, 2, 1, repeat
  speed: 10,                   // 10 FPS
  loop: true
});

animator.defineAnimation('walk', {
  frameIndices: [4, 5, 6, 7],
  speed: 12,
  loop: true
});

animator.defineAnimation('jump', {
  frameIndices: [8, 9, 10],
  speed: 15,
  loop: false,
  onComplete: () => console.log('Jump done!')
});

// Play animation
animator.play('walk');

// In game loop:
function update(dt) {
  animator.update(dt);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  animator.draw(100, 100, 1, 1); // Draw at (100, 100), no flip
}

// Control playback
animator.pause();
animator.resume();
animator.stop();

// Check state
if (animator.isAnimating()) {
  console.log('Frame:', animator.getCurrentFrameIndex());
}
```

## Sprite Sheet Layout

Frames are indexed row-by-row from top-left:

```
Frame 0  Frame 1  Frame 2  Frame 3
Frame 4  Frame 5  Frame 6  Frame 7
Frame 8  Frame 9  Frame 10 Frame 11
```

## Performance

Minimal overhead — just tracks elapsed time and frame indices. Canvas drawImage is the bottleneck, not this module.

## Tips

- **Flipping**: Use negative scaleX to flip horizontally: `animator.draw(x, y, -1, 1)`.
- **Ping-pong**: Use for looped animations to avoid frame duplication at edges.
- **Callbacks**: Chain animations by calling `animator.play(nextAnimation)` in onComplete.

*Open source — use it wisely.*
