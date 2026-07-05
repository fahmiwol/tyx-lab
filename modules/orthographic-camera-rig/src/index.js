/**
 * Orthographic Camera Rig
 *
 * Dimetric/isometric camera with smooth follow, drag-to-pan, zoom, and relative movement.
 * Optimized for top-down games with responsive mouse/touch input.
 *
 * Usage:
 *   import { OrthographicCameraRig } from './index.js';
 *   const cam = new OrthographicCameraRig({
 *     width: window.innerWidth,
 *     height: window.innerHeight,
 *     zoom: 1,
 *     followSmoothing: 0.1
 *   });
 *   cam.init();
 *
 *   // In loop:
 *   cam.follow(playerX, playerY);
 *   cam.update(dt);
 *   renderer.render(scene, cam.camera);
 */

import * as THREE from 'three';

export class OrthographicCameraRig {
  constructor(options = {}) {
    this.width = options.width ?? window.innerWidth;
    this.height = options.height ?? window.innerHeight;
    this.zoom = options.zoom ?? 1;
    this.followSmoothing = options.followSmoothing ?? 0.1;
    this.panSpeed = options.panSpeed ?? 1;

    // Target position for follow
    this.targetX = 0;
    this.targetY = 0;

    // Actual camera position (smoothed)
    this.camX = 0;
    this.camY = 0;

    // Drag state
    this._dragging = false;
    this._lastX = 0;
    this._lastY = 0;

    this.camera = null;
  }

  init() {
    const aspect = this.width / this.height;
    this.camera = new THREE.OrthographicCamera(
      -aspect * this.zoom,
      aspect * this.zoom,
      this.zoom,
      -this.zoom,
      0.1,
      1000
    );

    this.camera.position.z = 10;
    this._setupInput();
    return this;
  }

  _setupInput() {
    // Drag to pan
    document.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      this._dragging = true;
      this._lastX = e.clientX;
      this._lastY = e.clientY;
    });

    document.addEventListener('pointermove', (e) => {
      if (!this._dragging) return;
      const dx = e.clientX - this._lastX;
      const dy = e.clientY - this._lastY;
      this.targetX -= (dx / this.width) * this.zoom * 2 * this.panSpeed;
      this.targetY += (dy / this.height) * this.zoom * 2 * this.panSpeed;
      this._lastX = e.clientX;
      this._lastY = e.clientY;
    });

    document.addEventListener('pointerup', () => {
      this._dragging = false;
    });

    // Wheel zoom
    document.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom = Math.max(0.5, Math.min(5, this.zoom + e.deltaY * 0.001));
      this._updateProjection();
    }, { passive: false });

    // Resize
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this._updateProjection();
    });
  }

  follow(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  update(dt) {
    this.camX += (this.targetX - this.camX) * this.followSmoothing;
    this.camY += (this.targetY - this.camY) * this.followSmoothing;

    this.camera.position.x = this.camX;
    this.camera.position.y = this.camY;
  }

  setZoom(z) {
    this.zoom = Math.max(0.5, Math.min(5, z));
    this._updateProjection();
  }

  _updateProjection() {
    const aspect = this.width / this.height;
    this.camera.left = -aspect * this.zoom;
    this.camera.right = aspect * this.zoom;
    this.camera.top = this.zoom;
    this.camera.bottom = -this.zoom;
    this.camera.updateProjectionMatrix();
  }

  // Get movement delta relative to camera angle (for game controls)
  getMoveDelta(direction) {
    // Simple cardinal mapping (extend with angle if needed)
    const deltas = {
      up: { x: 0, y: 1 },
      down: { x: 0, y: -1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };
    return deltas[direction] || { x: 0, y: 0 };
  }

  dispose() {
    // Cleanup if needed
  }
}
