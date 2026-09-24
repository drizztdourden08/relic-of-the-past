/* @layer renderer-hud @kind logic */
/**
 * What gives the open water below the mirrored trees some body: stepped bands that deepen the blue
 * toward the bottom, and scattered one-row ripples, some a shade lighter and some a shade darker,
 * each drifting at its own pace and breathing in and out. All whole pixels, so it reads as pixel art.
 */
import type { SceneGeometry, SceneLayer } from '../scene.type';
import { seededRandom } from '../seeded-random';
import { wrapX } from './ridge-layer';

/** The open water starts this far down the lake; the mirrored trees own the rows above. */
const OPEN_WATER_FROM = 0.3;
const BANDS = 4;
const BAND_COLOUR = '50, 70, 170';
const BAND_ALPHA_STEP = 0.045;
const RIPPLE_EVERY_PX = 6;
const RIPPLE_WIDTH = { min: 3, max: 10 } as const;
const RIPPLE_SPEED = { min: 0.2, max: 0.8 } as const;
const RIPPLE_BREATH_RATE = 0.7;
const LIGHT = '235, 243, 255';
const DARK = '44, 62, 150';
const LIGHT_ALPHA = 0.42;
const DARK_ALPHA = 0.3;
const RIPPLE_PARALLAX = 0.5;

interface Ripple {
  x: number;
  y: number;
  w: number;
  light: boolean;
  speed: number;
  phase: number;
}

const waterTextureLayer = (geometry: SceneGeometry, seed: number): SceneLayer => {
  const { width, height, horizonY } = geometry;
  const waterTop = horizonY + 2;
  const waterH = height - waterTop;
  const openTop = waterTop + Math.round(waterH * OPEN_WATER_FROM);
  const openH = height - openTop;
  const rng = seededRandom(seed ^ 0x5eed);
  const ripples: Ripple[] = [];
  for (let i = 0, n = Math.max(6, Math.round(width / RIPPLE_EVERY_PX)); i < n; i++) {
    ripples.push({
      x: rng.range(0, width), y: openTop + rng.int(0, Math.max(0, openH - 1)),
      w: rng.int(RIPPLE_WIDTH.min, RIPPLE_WIDTH.max), light: rng.chance(0.6),
      speed: rng.range(RIPPLE_SPEED.min, RIPPLE_SPEED.max), phase: rng.range(0, Math.PI * 2),
    });
  }

  return {
    draw: (ctx, { t, drift, moving }) => {
      if (openH <= 0) return;
      const bandH = Math.ceil(openH / BANDS);
      for (let b = 0; b < BANDS; b++) {
        ctx.fillStyle = `rgba(${BAND_COLOUR}, ${(b + 1) * BAND_ALPHA_STEP})`;
        ctx.fillRect(0, openTop + b * bandH, width, bandH);
      }
      for (const r of ripples) {
        const breath = moving ? 0.55 + 0.45 * Math.sin(t * RIPPLE_BREATH_RATE + r.phase) : 0.8;
        const own = moving ? t * r.speed : 0;
        const x = Math.round(wrapX(r.x + own - drift * RIPPLE_PARALLAX, r.w, width));
        ctx.fillStyle = r.light ? `rgba(${LIGHT}, ${LIGHT_ALPHA * breath})` : `rgba(${DARK}, ${DARK_ALPHA * breath})`;
        ctx.fillRect(x, r.y, r.w, 1);
      }
    },
  };
};

export { waterTextureLayer };
