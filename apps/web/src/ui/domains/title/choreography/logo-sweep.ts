/* @layer renderer-hud @kind logic */
/**
 * A band of light that sweeps across the logo every little while: a slanted bright stripe with a
 * softer halo, kept to the logo's own pixels. It sets off fast, all but stops about a third of the
 * way across, then runs on at full speed to the far edge. Each pass has its own brightness, and the
 * rest before the next is a random few seconds.
 */
import { LOGO_AT } from '@shared/game/title/title-layout';
import { seededRandom } from '../scene/seeded-random';
import type { Picture } from './draw-title-frame';

const SWEEP_SECONDS = 1.6;
const REST_SECONDS = { min: 4, max: 9 } as const;
const STRENGTH = { min: 0.45, max: 1 } as const;
/** The stripe's slant across the logo's height, in pixels, and its widths. */
const SLANT = 28;
const HALO_W = 14;
const CORE_W = 4;
const HALO_ALPHA = 0.45;
const CORE_ALPHA = 0.85;
/** Where the pass eases off, how wide that dwell is, and how much speed it keeps there. */
const DWELL_AT = 0.33;
const DWELL_WIDTH = 0.2;
const DWELL_SPEED = 0.35;
const CURVE_STEPS = 128;

/**
 * Distance travelled against time, as a table: the speed eases off around the dwell and is
 * integrated, then the whole is scaled so the pass still ends at the far edge.
 */
const buildCurve = (): Float32Array => {
  const table = new Float32Array(CURVE_STEPS + 1);
  let travelled = 0;
  for (let i = 1; i <= CURVE_STEPS; i++) {
    const u = i / CURVE_STEPS;
    const dip = Math.exp(-(((u - DWELL_AT) / DWELL_WIDTH) ** 2));
    travelled += 1 - (1 - DWELL_SPEED) * dip;
    table[i] = travelled;
  }
  for (let i = 0; i <= CURVE_STEPS; i++) table[i] /= travelled;
  return table;
};

const CURVE = buildCurve();

const eased = (u: number): number => {
  const at = Math.min(CURVE_STEPS - 1, Math.floor(u * CURVE_STEPS));
  const frac = u * CURVE_STEPS - at;
  return CURVE[at] + (CURVE[at + 1] - CURVE[at]) * frac;
};

interface LogoSweep {
  draw: (ctx: CanvasRenderingContext2D, t: number, logo: Picture, alpha: number, frameX: number, frameY: number) => void;
}

const createLogoSweep = (seed: number): LogoSweep => {
  const rng = seededRandom(seed ^ 0x5ee9);
  const strip = document.createElement('canvas');
  let nextAt = rng.range(1.5, 3);
  let start = -1;
  let strength = 1;

  const band = (sctx: CanvasRenderingContext2D, x: number, w: number, h: number, a: number): void => {
    sctx.fillStyle = `rgba(255, 255, 255, ${a})`;
    sctx.beginPath();
    sctx.moveTo(x, 0);
    sctx.lineTo(x + w, 0);
    sctx.lineTo(x + w - SLANT, h);
    sctx.lineTo(x - SLANT, h);
    sctx.closePath();
    sctx.fill();
  };

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
      // Keep only what lands on the logo's own pixels.
      sctx.globalCompositeOperation = 'source-in';
      const x = Math.round(-HALO_W + eased(u) * (w + HALO_W + SLANT));
      band(sctx, x, HALO_W, h, HALO_ALPHA * strength);
      sctx.globalCompositeOperation = 'source-atop';
      band(sctx, x + (HALO_W - CORE_W) / 2, CORE_W, h, CORE_ALPHA * strength);
      ctx.globalAlpha = alpha;
      ctx.drawImage(strip, frameX + LOGO_AT.x, frameY + LOGO_AT.y);
      ctx.globalAlpha = 1;
    },
  };
};

export { createLogoSweep };
export type { LogoSweep };
