/* @layer renderer-hud @kind logic */
import { LOGO_AT } from '@rotp/game-data';
import { seededRandom } from '../scene/seeded-random';
import type { LogoSweep } from './choreography.type';
import { easeSweep } from './ease-sweep';
import {
  CORE_ALPHA, CORE_W, FIRST_SWEEP_SECONDS, HALO_ALPHA, HALO_W, REST_SECONDS, STRENGTH, STRIPE_SLANT_PX, SWEEP_SECONDS, SWEEP_SEED_SALT,
} from './logo-sweep.constants';

const drawBand = (sctx: CanvasRenderingContext2D, x: number, w: number, h: number, a: number): void => {
  sctx.fillStyle = `rgba(255, 255, 255, ${a})`;
  sctx.beginPath();
  sctx.moveTo(x, 0);
  sctx.lineTo(x + w, 0);
  sctx.lineTo(x + w - STRIPE_SLANT_PX, h);
  sctx.lineTo(x - STRIPE_SLANT_PX, h);
  sctx.closePath();
  sctx.fill();
};

const createLogoSweep = (seed: number): LogoSweep => {
  const rng = seededRandom(seed ^ SWEEP_SEED_SALT);
  const strip = document.createElement('canvas');
  let nextAt = rng.range(FIRST_SWEEP_SECONDS.min, FIRST_SWEEP_SECONDS.max);
  let start = -1;
  let strength = 1;

  return {
    draw: (ctx, t, logo, alpha, frameX, frameY) => {
      if (alpha <= 0) return;
      if (start < 0 && t >= nextAt) {
        start = t;
        strength = rng.range(STRENGTH.min, STRENGTH.max);
      }
      if (start < 0) return;
      const u = (t - start) / SWEEP_SECONDS;
      if (u >= 1) {
        start = -1;
        nextAt = t + rng.range(REST_SECONDS.min, REST_SECONDS.max);
        return;
      }
      const w = Math.round(logo.img.width / logo.scale);
      const h = Math.round(logo.img.height / logo.scale);
      if (strip.width !== w || strip.height !== h) { strip.width = w; strip.height = h; }
      const sctx = strip.getContext('2d');
      if (!sctx) return;
      sctx.imageSmoothingEnabled = false;
      sctx.globalCompositeOperation = 'source-over';
      sctx.clearRect(0, 0, w, h);
      sctx.drawImage(logo.img, 0, 0, w, h);
      sctx.globalCompositeOperation = 'source-in';
      const x = Math.round(-HALO_W + easeSweep(u) * (w + HALO_W + STRIPE_SLANT_PX));
      drawBand(sctx, x, HALO_W, h, HALO_ALPHA * strength);
      sctx.globalCompositeOperation = 'source-atop';
      drawBand(sctx, x + (HALO_W - CORE_W) / 2, CORE_W, h, CORE_ALPHA * strength);
      ctx.globalAlpha = alpha;
      ctx.drawImage(strip, frameX + LOGO_AT.x, frameY + LOGO_AT.y);
      ctx.globalAlpha = 1;
    },
  };
};

export { createLogoSweep };
