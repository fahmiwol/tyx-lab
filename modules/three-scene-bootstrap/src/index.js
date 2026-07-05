/**
 * Three.js Scene Bootstrap
 *
 * Minimal WebGL scene setup: renderer, scene, lights, fog, resize handling.
 * Extensible through factory methods and light configuration objects.
 *
 * Usage:
 *   import { ThreeSceneBootstrap } from './index.js';
 *   const bootstrap = new ThreeSceneBootstrap('canvas', {
 *     clearColor: 0x87CEEB,
 *     fog: { type: 'exp2', color: 0x87CEEB, density: 0.006 },
 *     lights: [
 *       { type: 'ambient', color: 0xfff4e0, intensity: 0.6 },
 *       { type: 'directional', color: 0xfff4c0, intensity: 1.2, position: [10, 20, 10], shadows: true }
 *     ]
 *   });
 *   bootstrap.init();
 *   bootstrap.setCamera(camera);
 *
 *   // In animation loop:
 *   bootstrap.render();
 *   const dt = bootstrap.getDelta();
 */

import * as THREE from 'three';

export class ThreeSceneBootstrap {
  constructor(canvasId, config = {}) {
    this.canvas = document.getElementById(canvasId);
    this.scene = new THREE.Scene();
    this.renderer = null;
    this.camera = null;
    this.clock = new THREE.Clock();

    this.config = {
      clearColor: config.clearColor ?? 0x87ceeb,
      pixelRatio: config.pixelRatio ?? Math.min(window.devicePixelRatio, 2),
      antialias: config.antialias ?? true,
      fog: config.fog || null,
      lights: config.lights || [],
      shadowMapType: config.shadowMapType ?? THREE.PCFSoftShadowMap,
      ...config
    };

    this.lights = {};
  }

  init() {
    const W = window.innerWidth, H = window.innerHeight;

    // WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: this.config.antialias,
      alpha: this.config.alpha ?? false
    });
    this.renderer.setPixelRatio(this.config.pixelRatio);
    this.renderer.setSize(W, H);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = this.config.shadowMapType;
    this.renderer.setClearColor(this.config.clearColor, 1);

    // Fog
    if (this.config.fog) {
      this._setupFog();
    }

    // Lights
    if (this.config.lights.length > 0) {
      for (const lightCfg of this.config.lights) {
        this._addLight(lightCfg);
      }
    }

    // Resize handler
    window.addEventListener('resize', () => this._onResize());

    return this;
  }

  _setupFog() {
    const f = this.config.fog;
    if (f.type === 'exp2') {
      this.scene.fog = new THREE.FogExp2(f.color ?? 0x87ceeb, f.density ?? 0.006);
    } else if (f.type === 'linear') {
      this.scene.fog = new THREE.Fog(f.color ?? 0x87ceeb, f.near ?? 1, f.far ?? 1000);
    }
  }

  _addLight(cfg) {
    let light;
    const type = cfg.type ?? 'ambient';

    switch (type) {
      case 'ambient':
        light = new THREE.AmbientLight(cfg.color ?? 0xffffff, cfg.intensity ?? 0.6);
        this.lights.ambient = light;
        break;

      case 'directional':
        light = new THREE.DirectionalLight(cfg.color ?? 0xffffff, cfg.intensity ?? 1.0);
        if (cfg.position) light.position.set(...cfg.position);
        if (cfg.shadows) {
          light.castShadow = true;
          light.shadow.mapSize.width = cfg.shadowMapSize ?? 1024;
          light.shadow.mapSize.height = cfg.shadowMapSize ?? 1024;
          light.shadow.camera.near = cfg.shadowNear ?? 0.1;
          light.shadow.camera.far = cfg.shadowFar ?? 100;
          if (cfg.shadowBox) {
            const b = cfg.shadowBox;
            light.shadow.camera.left = b.left ?? -30;
            light.shadow.camera.right = b.right ?? 30;
            light.shadow.camera.top = b.top ?? 30;
            light.shadow.camera.bottom = b.bottom ?? -30;
          }
        }
        this.lights.directional = light;
        break;

      case 'hemisphere':
        light = new THREE.HemisphereLight(cfg.skyColor ?? 0xffffff, cfg.groundColor ?? 0x808080, cfg.intensity ?? 0.4);
        this.lights.hemisphere = light;
        break;

      case 'point':
        light = new THREE.PointLight(cfg.color ?? 0xffffff, cfg.intensity ?? 1.0, cfg.distance ?? 0);
        if (cfg.position) light.position.set(...cfg.position);
        if (cfg.shadows) light.castShadow = true;
        if (!this.lights.points) this.lights.points = [];
        this.lights.points.push(light);
        break;
    }

    if (light) {
      this.scene.add(light);
    }
  }

  setCamera(camera) {
    this.camera = camera;
    return this;
  }

  render() {
    if (this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  getDelta() {
    return this.clock.getDelta();
  }

  _onResize() {
    const W = window.innerWidth, H = window.innerHeight;
    if (this.camera) {
      if (this.camera.aspect !== undefined) {
        this.camera.aspect = W / H;
        this.camera.updateProjectionMatrix();
      }
    }
    if (this.renderer) {
      this.renderer.setSize(W, H);
    }
  }

  dispose() {
    window.removeEventListener('resize', () => this._onResize());
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  // Utility: get light by name
  getLight(name) {
    return this.lights[name] || null;
  }
}
