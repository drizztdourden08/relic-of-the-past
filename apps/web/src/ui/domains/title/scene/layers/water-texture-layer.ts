/* @layer renderer-hud @kind logic */
import type { Ripple, SceneGeometry, SceneLayer } from '../scene.type';
import { seededRandom } from '../seeded-random';
import {
  BAND_ALPHA_STEP, BAND_COLOUR, OPEN_WATER_FROM, RIPPLE_BREATH_RATE, RIPPLE_DARK, RIPPLE_DARK_ALPHA, RIPPLE_EVERY_PX, RIPPLE_LIGHT,
  RIPPLE_LIGHT_ALPHA, RIPPLE_PARALLAX, RIPPLE_SEED_SALT, RIPPLE_SPEED, RIPPLE_WIDTH, WATER_BANDS,
} from './layers.constants';
import { wrapX } from './wrap-x';

const waterTextureLayer = (geometry: SceneGeometry, seed: number): SceneLayer => {
  const { width, height, horizonY } = geometry;
  const waterTop = horizonY + 2;
  const waterH = height - waterTop;
  const openTop = waterTop + Math.round(waterH * OPEN_WATER_FROM);
  const openH = height - openTop;
  const rng = seededRandom(seed ^ RIPPLE_SEED_SALT);
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
      const bandH = Math.ceil(openH / WATER_BANDS);
      for (let b = 0; b < WATER_BANDS; b++) {
        ctx.fillStyle = `rgba(${BAND_COLOUR}, ${(b + 1) * BAND_ALPHA_STEP})`;
        ctx.fillRect(0, openTop + b * bandH, width, bandH);
      }
      for (const r of ripples) {
        const breath = moving ? 0.55 + 0.45 * Math.sin(t * RIPPLE_BREATH_RATE + r.phase) : 0.8;
        const own = moving ? t * r.speed : 0;
        const x = Math.round(wrapX(r.x + own - drift * RIPPLE_PARALLAX, r.w, width));
        ctx.fillStyle = r.light ? `rgba(${RIPPLE_LIGHT}, ${RIPPLE_LIGHT_ALPHA * breath})` : `rgba(${RIPPLE_DARK}, ${RIPPLE_DARK_ALPHA * breath})`;
        ctx.fillRect(x, r.y, r.w, 1);
      }
    },
  };
};

export { waterTextureLayer };
