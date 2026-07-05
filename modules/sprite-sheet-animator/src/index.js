/**
 * Sprite Sheet Animator
 *
 * Canvas 2D sprite animation from texture atlases (sprite sheets).
 * Plays sequences of frames at configurable speed with loop/ping-pong support.
 *
 * Usage:
 *   import { SpriteSheetAnimator } from './index.js';
 *   const animator = new SpriteSheetAnimator(context, {
 *     image: charImageElement,
 *     frameWidth: 64,
 *     frameHeight: 64,
 *     cols: 4,
 *     rows: 3
 *   });
 *
 *   animator.play('walk', { frameIndices: [0, 1, 2, 3], speed: 10, loop: true });
 *   animator.update(deltaTime);
 *   animator.draw(x, y);
 */

export class SpriteSheetAnimator {
  constructor(canvasContext, config) {
    this.ctx = canvasContext;
    this.image = config.image;
    this.frameWidth = config.frameWidth;
    this.frameHeight = config.frameHeight;
    this.cols = config.cols || 1;
    this.rows = config.rows || 1;

    // Animation state
    this.animations = {}; // { name: { frameIndices, speed, loop, etc. } }
    this.currentAnimation = null;
    this.frameIndex = 0;
    this.elapsedTime = 0;
    this.isPlaying = false;
    this.isPaused = false;

    // Post-animation callback
    this.onComplete = null;
  }

  /**
   * Define animation sequence.
   * @param {string} name — Animation identifier
   * @param {Object} config — { frameIndices, speed, loop, pingPong, onComplete }
   */
  defineAnimation(name, config) {
    this.animations[name] = {
      frameIndices: config.frameIndices || [0],
      speed: config.speed ?? 10, // frames per second
      loop: config.loop ?? false,
      pingPong: config.pingPong ?? false,
      onComplete: config.onComplete || null
    };
  }

  /**
   * Play animation by name.
   */
  play(name, overrides = {}) {
    if (!this.animations[name]) {
      console.warn(`[SpriteSheetAnimator] Unknown animation: ${name}`);
      return;
    }

    this.currentAnimation = { ...this.animations[name], ...overrides };
    this.frameIndex = 0;
    this.elapsedTime = 0;
    this.isPlaying = true;
    this.isPaused = false;
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  stop() {
    this.isPlaying = false;
    this.currentAnimation = null;
    this.frameIndex = 0;
    this.elapsedTime = 0;
  }

  /**
   * Update animation state.
   * @param {number} dt — Delta time in seconds
   */
  update(dt) {
    if (!this.isPlaying || !this.currentAnimation || this.isPaused) return;

    this.elapsedTime += dt;
    const frameTime = 1 / this.currentAnimation.speed;

    if (this.elapsedTime >= frameTime) {
      this.elapsedTime -= frameTime;
      this.frameIndex++;

      const { frameIndices, pingPong, loop, onComplete } = this.currentAnimation;
      const maxIndex = frameIndices.length - 1;

      if (this.frameIndex > maxIndex) {
        if (pingPong) {
          // Reverse playback
          this.frameIndex = Math.max(0, this.frameIndex - 2);
        } else if (loop) {
          this.frameIndex = 0;
        } else {
          this.isPlaying = false;
          this.frameIndex = maxIndex;
          if (onComplete) onComplete();
        }
      }
    }
  }

  /**
   * Draw current frame at given position.
   */
  draw(x, y, scaleX = 1, scaleY = 1) {
    if (!this.currentAnimation) return;

    const { frameIndices } = this.currentAnimation;
    const frameIdx = frameIndices[Math.min(this.frameIndex, frameIndices.length - 1)];

    const col = frameIdx % this.cols;
    const row = Math.floor(frameIdx / this.cols);

    const sx = col * this.frameWidth;
    const sy = row * this.frameHeight;

    this.ctx.save();
    this.ctx.translate(x + this.frameWidth / 2, y + this.frameHeight / 2);
    if (scaleX !== 1 || scaleY !== 1) {
      this.ctx.scale(scaleX, scaleY);
    }
    this.ctx.drawImage(
      this.image,
      sx, sy,
      this.frameWidth, this.frameHeight,
      -this.frameWidth / 2, -this.frameHeight / 2,
      this.frameWidth, this.frameHeight
    );
    this.ctx.restore();
  }

  getCurrentFrameIndex() {
    return this.frameIndex;
  }

  isAnimating() {
    return this.isPlaying;
  }
}
