/**
 * Raycaster Object Picker
 *
 * Three.js mouse/touch input to 3D object selection via raycasting.
 * Works with any camera and scene. Provides picked objects, click callbacks, and hover state.
 *
 * Usage:
 *   import { RaycastPicker } from './index.js';
 *   const picker = new RaycastPicker(camera, scene, {
 *     enableHover: true,
 *     hoverColor: 0x00ff00
 *   });
 *
 *   picker.on('pick', (obj) => {
 *     console.log('Clicked:', obj.name);
 *   });
 *
 *   picker.on('hover', (obj) => {
 *     // Highlight obj
 *   });
 *
 *   // In render loop:
 *   picker.update(mouse.x, mouse.y);
 */

import * as THREE from 'three';

export class RaycastPicker {
  constructor(camera, scene, options = {}) {
    this.camera = camera;
    this.scene = scene;
    this.enableHover = options.enableHover ?? false;
    this.hoverColor = options.hoverColor ?? 0xffff00;
    this.pickableTag = options.pickableTag ?? 'pickable';

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.pickedObjects = [];
    this.hoveredObject = null;

    this._listeners = {};
    this._originalMaterials = new WeakMap();

    this._setupInput();
  }

  _setupInput() {
    document.addEventListener('click', (e) => {
      this._updateMouse(e.clientX, e.clientY);
      const picked = this._raycast();
      if (picked.length > 0) {
        this._emit('pick', picked[0]);
        this.pickedObjects = picked;
      }
    });

    document.addEventListener('mousemove', (e) => {
      this._updateMouse(e.clientX, e.clientY);
      if (this.enableHover) {
        this._updateHover();
      }
    });

    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        this._updateMouse(touch.clientX, touch.clientY);
        const picked = this._raycast();
        if (picked.length > 0) {
          this._emit('pick', picked[0]);
          this.pickedObjects = picked;
        }
      }
    });

    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        this._updateMouse(touch.clientX, touch.clientY);
        if (this.enableHover) {
          this._updateHover();
        }
      }
    });
  }

  _updateMouse(clientX, clientY) {
    const rect = document.documentElement;
    this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;
  }

  _raycast() {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const pickables = this.scene.children.filter(child => {
      return child.userData && child.userData[this.pickableTag];
    });

    const intersects = this.raycaster.intersectObjects(pickables, true);
    return intersects.map(hit => hit.object);
  }

  _updateHover() {
    const picked = this._raycast();
    const newHovered = picked.length > 0 ? picked[0] : null;

    if (newHovered !== this.hoveredObject) {
      // Unhover previous
      if (this.hoveredObject) {
        this._restoreMaterial(this.hoveredObject);
        this._emit('unhover', this.hoveredObject);
      }

      // Hover new
      if (newHovered) {
        this._applyHoverMaterial(newHovered);
        this._emit('hover', newHovered);
      }

      this.hoveredObject = newHovered;
    }
  }

  _applyHoverMaterial(obj) {
    if (!obj.material) return;

    // Save original
    const original = obj.material.color ? obj.material.color.getHex() : null;
    this._originalMaterials.set(obj, original);

    // Apply hover color
    if (obj.material.color) {
      obj.material.color.setHex(this.hoverColor);
    }
  }

  _restoreMaterial(obj) {
    const original = this._originalMaterials.get(obj);
    if (original !== null && obj.material && obj.material.color) {
      obj.material.color.setHex(original);
    }
  }

  on(event, callback) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
  }

  off(event, callback) {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    }
  }

  _emit(event, data) {
    if (this._listeners[event]) {
      for (const callback of this._listeners[event]) {
        callback(data);
      }
    }
  }

  setPickableTag(tag) {
    this.pickableTag = tag;
  }

  getPicked() {
    return [...this.pickedObjects];
  }

  getHovered() {
    return this.hoveredObject;
  }

  dispose() {
    // Cleanup
    if (this.hoveredObject) {
      this._restoreMaterial(this.hoveredObject);
    }
  }
}
