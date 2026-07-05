/**
 * DayNightCycle.js — Time-based lighting and environment cycle
 *
 * Interpolates scene lighting (directional, ambient, fog, background) through 24-hour keyframes.
 * Supports wall-clock time (UTC+7 default), fast-mode acceleration for demos, and forced hour override.
 *
 * For use with Three.js scenes that have directional and ambient lights.
 * Designed for cyberpunk/low-poly aesthetics but easily customizable via keyframe colors/intensities.
 *
 * Usage:
 *   const cycle = new DayNightCycle(renderer);
 *   // In game loop:
 *   cycle.update(deltaTime);
 *   cycle.forceHour(12); // Override time for testing
 */

import * as THREE from 'three';

const KF = [
  // 24-hour keyframes: { h (hour), dc (dirColor), di (dirIntensity), ac (ambColor), ai (ambIntensity), fc (fogColor), bc (bgColor), fd (fogDensity) }
  {  h:  0, dc: 0x1a1a66, di: 0.20, ac: 0x080820, ai: 0.35, fc: 0x04040f, bc: 0x04040f, fd: 0.007 },
  {  h:  5, dc: 0x2222aa, di: 0.25, ac: 0x0a0a28, ai: 0.40, fc: 0x05050e, bc: 0x05050e, fd: 0.006 },
  {  h:  6, dc: 0xdd7733, di: 0.55, ac: 0x2a1a2a, ai: 0.65, fc: 0x160a10, bc: 0x120810, fd: 0.005 },
  {  h:  7, dc: 0xffcc66, di: 1.00, ac: 0x3a3a66, ai: 0.90, fc: 0x0d0d18, bc: 0x0a0a16, fd: 0.005 },
  {  h: 10, dc: 0xffeedd, di: 1.50, ac: 0x4444aa, ai: 1.20, fc: 0x0a0a1a, bc: 0x08081a, fd: 0.005 },
  {  h: 14, dc: 0xffe8cc, di: 1.40, ac: 0x3a3a99, ai: 1.10, fc: 0x0a0a1a, bc: 0x08081a, fd: 0.005 },
  {  h: 17, dc: 0xff7744, di: 1.00, ac: 0x2a1a11, ai: 0.70, fc: 0x120908, bc: 0x100807, fd: 0.005 },
  {  h: 18, dc: 0xcc4422, di: 0.60, ac: 0x1a1010, ai: 0.55, fc: 0x0e0605, bc: 0x0c0503, fd: 0.006 },
  {  h: 19, dc: 0x4422aa, di: 0.30, ac: 0x0d0d24, ai: 0.40, fc: 0x060610, bc: 0x060610, fd: 0.006 },
  {  h: 21, dc: 0x1a1a66, di: 0.20, ac: 0x080820, ai: 0.35, fc: 0x04040f, bc: 0x04040f, fd: 0.007 },
  {  h: 24, dc: 0x1a1a66, di: 0.20, ac: 0x080820, ai: 0.35, fc: 0x04040f, bc: 0x04040f, fd: 0.007 },
];

function getPhase(hour) {
  if (hour >= 6   && hour < 7)  return 'dawn';
  if (hour >= 7   && hour < 17) return 'day';
  if (hour >= 17  && hour < 19) return 'dusk';
  return 'night';
}

function lerpN(a, b, t) { return a + (b - a) * t; }

function lerpColor(ca, cb, t) {
  const ar = (ca >> 16) & 0xff, ag = (ca >> 8) & 0xff, ab = ca & 0xff;
  const br = (cb >> 16) & 0xff, bg = (cb >> 8) & 0xff, bb = cb & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | b;
}

export class DayNightCycle {
  constructor(renderer) {
    this._renderer = renderer;
    this._forceHour = null;
    this._fastTime = 0;
    this._lastPhase = null;
    this._tmpColor = new THREE.Color();
    this._tzOffsetHours = 7; // UTC+7 (Jakarta default)
  }

  static FAST_MODE = false; // 60× realtime

  forceHour(h) { this._forceHour = h; }
  setTimezone(offsetHours) { this._tzOffsetHours = offsetHours; }

  getHour() {
    if (this._forceHour !== null) return this._forceHour;
    const now = new Date();
    const adjusted = new Date(now.getTime() + this._tzOffsetHours * 3600 * 1000);
    return (adjusted.getUTCHours() + adjusted.getUTCMinutes() / 60 + adjusted.getUTCSeconds() / 3600) % 24;
  }

  getPhase() { return getPhase(this.getHour()); }

  update(dt) {
    let hour = this._forceHour !== null ? this._forceHour
             : DayNightCycle.FAST_MODE ? ((this._fastTime += dt * 60) / 3600) % 24
             : this.getHour();

    const kf = this._interpolateKeyframes(hour);
    this._applyToScene(kf);

    const phase = getPhase(hour);
    if (phase !== this._lastPhase) {
      this._lastPhase = phase;
      console.log(`[DayNight] ${phase} (${hour.toFixed(1)}h)`);
    }
  }

  _interpolateKeyframes(hour) {
    let lo = KF[0], hi = KF[KF.length - 1];
    for (let i = 0; i < KF.length - 1; i++) {
      if (hour >= KF[i].h && hour < KF[i + 1].h) {
        lo = KF[i]; hi = KF[i + 1];
        break;
      }
    }
    const span = hi.h - lo.h || 1;
    const t = (hour - lo.h) / span;
    return {
      dirColor: lerpColor(lo.dc, hi.dc, t),
      dirInt: lerpN(lo.di, hi.di, t),
      ambColor: lerpColor(lo.ac, hi.ac, t),
      ambInt: lerpN(lo.ai, hi.ai, t),
      fogColor: lerpColor(lo.fc, hi.fc, t),
      bgColor: lerpColor(lo.bc, hi.bc, t),
      fogDensity: lerpN(lo.fd, hi.fd, t),
    };
  }

  _applyToScene(kf) {
    const r = this._renderer;
    if (!r) return;
    if (r.dirLight) {
      r.dirLight.color.setHex(kf.dirColor);
      r.dirLight.intensity = kf.dirInt;
    }
    if (r.ambientLight) {
      r.ambientLight.color.setHex(kf.ambColor);
      r.ambientLight.intensity = kf.ambInt;
    }
    if (r.scene && r.scene.fog) {
      r.scene.fog.color.setHex(kf.fogColor);
      if (r.scene.fog.density !== undefined) r.scene.fog.density = kf.fogDensity;
    }
    if (r.renderer) r.renderer.setClearColor(kf.bgColor, 1);
  }
}
