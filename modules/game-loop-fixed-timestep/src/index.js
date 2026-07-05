/**
 * Game Loop with Fixed Timestep
 *
 * Implements fixed-rate game update (e.g., 60 Hz) while rendering at monitor refresh rate.
 * Decouples physics/logic updates from frame rate, preventing determinism issues.
 *
 * Usage:
 *   import { GameLoop } from './index.js';
 *   const loop = new GameLoop({
 *     fixedDt: 1 / 60,           // Fixed 60 Hz
 *     maxFrameSkip: 5,           // Max updates per frame
 *     onUpdate: (dt) => { ... }, // Physics/logic
 *     onRender: () => { ... }    // Rendering
 *   });
 *   loop.start();
 */

export class GameLoop {
  constructor(options = {}) {
    this.fixedDt = options.fixedDt ?? 1 / 60;      // 60 Hz default
    this.maxFrameSkip = options.maxFrameSkip ?? 5;
    this.onUpdate = options.onUpdate ?? (() => {});
    this.onRender = options.onRender ?? (() => {});
    this.onFixedUpdate = options.onFixedUpdate ?? (() => {}); // Alias
    this.onBeforeRender = options.onBeforeRender ?? (() => {});
    this.onAfterRender = options.onAfterRender ?? (() => {});

    this.isRunning = false;
    this._accumulator = 0;
    this._lastFrameTime = 0;
    this._frameCount = 0;
    this._fps = 0;
    this._deltaTime = 0;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this._lastFrameTime = performance.now();
    this._accumulator = 0;
    this._frameCount = 0;

    const tick = (now) => {
      if (!this.isRunning) return;

      const frameDt = (now - this._lastFrameTime) * 0.001; // ms to seconds
      this._lastFrameTime = now;
      this._deltaTime = frameDt;

      // Cap frame delta to prevent spiral of death
      const cappedDt = Math.min(frameDt, 0.1);
      this._accumulator += cappedDt;

      // Fixed update loop
      let updateCount = 0;
      while (this._accumulator >= this.fixedDt && updateCount < this.maxFrameSkip) {
        this.onUpdate(this.fixedDt);
        this.onFixedUpdate(this.fixedDt); // Alias
        this._accumulator -= this.fixedDt;
        updateCount++;
      }

      // Render
      this.onBeforeRender();
      this.onRender();
      this.onAfterRender();

      // FPS counter
      this._frameCount++;
      if (this._frameCount % 60 === 0) {
        this._fps = Math.round(1 / frameDt);
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  stop() {
    this.isRunning = false;
  }

  getFps() {
    return this._fps;
  }

  getAccumulator() {
    return this._accumulator;
  }

  getInterpolation() {
    return Math.min(this._accumulator / this.fixedDt, 1);
  }

  setFixedDt(dt) {
    this.fixedDt = dt;
  }
}
