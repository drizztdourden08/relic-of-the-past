/* @layer renderer-lib @kind logic */
/**
 * The repeating patterns a message box ground can carry, each as a cell the painter tiles: its
 * natural pitch, whether odd rows shift by half a pitch (a brick layout), whether a cell spans the
 * whole width (a row pattern), and how to draw one cell centred on the origin at size 1. The
 * painter scales, spaces and scatters the cells; everything here is in game pixels.
 */
import type { DialogTexture } from '@shared/game/dialog/box-style';
import { triforcePath } from '@shared/game/dialog/frame-geometry';

interface PatternSpec {
  /** Grid pitch at density 100 and scale 1. */
  pitchX: number;
  pitchY: number;
  brick: boolean;
  /** Rows only: one cell spans the whole width, so the walk skips columns and scatter moves rows. */
  rows: boolean;
  /** Draw one cell centred on the origin; |width| is the area width, for row patterns. */
  draw: (ctx: CanvasRenderingContext2D, width: number) => void;
}

const HEX_RADIUS = 9;
const HEX_W = Math.sqrt(3) * HEX_RADIUS;

const hexagon = (ctx: CanvasRenderingContext2D): void => {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 6 + (i * Math.PI) / 3;
    const x = HEX_RADIUS * Math.cos(angle);
    const y = HEX_RADIUS * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
};

const TRIFORCE_H = 11;
const TRIFORCE = new Path2D(triforcePath(TRIFORCE_H));

const triforce = (filled: boolean) => (ctx: CanvasRenderingContext2D): void => {
  if (filled) ctx.fill(TRIFORCE); else ctx.stroke(TRIFORCE);
};

const PATTERNS: Record<Exclude<DialogTexture, 'none'>, PatternSpec> = {
  hex: { pitchX: HEX_W, pitchY: HEX_RADIUS * 1.5, brick: true, rows: false, draw: hexagon },
  'triforce-outline': { pitchX: 16, pitchY: 14, brick: true, rows: false, draw: triforce(false) },
  'triforce-filled': { pitchX: 16, pitchY: 14, brick: true, rows: false, draw: triforce(true) },
  scanlines: {
    pitchX: 1, pitchY: 2, brick: false, rows: true,
    draw: (ctx, width) => { ctx.fillRect(-width * 2, -0.5, width * 4, 1); },
  },
  stripes: {
    pitchX: 1, pitchY: 8, brick: false, rows: true,
    draw: (ctx, width) => { ctx.fillRect(-width * 2, -2, width * 4, 4); },
  },
};

const patternOf = (texture: DialogTexture): PatternSpec | null =>
  texture === 'none' ? null : PATTERNS[texture];

export { patternOf };
export type { PatternSpec };
