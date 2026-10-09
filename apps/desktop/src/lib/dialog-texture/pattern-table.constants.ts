/* @layer renderer-lib @kind constants */
import type { DialogTexture } from '@rotp/game-data';
import type { PatternSpec } from './patterns.type';
import { HEX_RADIUS, HEX_WIDTH } from './patterns.constants';
import { drawHexagon } from './draw-hexagon';
import { drawTriforce } from './draw-triforce';

const PATTERNS: Record<Exclude<DialogTexture, 'none'>, PatternSpec> = {
  hex: { pitchX: HEX_WIDTH, pitchY: HEX_RADIUS * 1.5, brick: true, rows: false, draw: drawHexagon },
  'triforce-outline': { pitchX: 16, pitchY: 14, brick: true, rows: false, draw: drawTriforce(false) },
  'triforce-filled': { pitchX: 16, pitchY: 14, brick: true, rows: false, draw: drawTriforce(true) },
  scanlines: {
    pitchX: 1, pitchY: 2, brick: false, rows: true,
    draw: (ctx, width) => { ctx.fillRect(-width * 2, -0.5, width * 4, 1); },
  },
  stripes: {
    pitchX: 1, pitchY: 8, brick: false, rows: true,
    draw: (ctx, width) => { ctx.fillRect(-width * 2, -2, width * 4, 4); },
  },
};

export { PATTERNS };
