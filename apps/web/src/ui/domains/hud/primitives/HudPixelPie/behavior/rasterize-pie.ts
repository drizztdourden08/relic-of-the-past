/* @layer renderer-hud @kind logic */
/**
 * Draws one frame of the pixel pie as palette indices, row by row. Slices already out leave the
 * dark disc showing. The next slice to leave takes its pulse colour. The slice that just went is
 * drawn again a whole number of pixels out along its bisector, thinned by an ordered dither.
 */
import { DITHER, EXIT_STEPS, INK, PULSE_LEVELS } from '../HudPixelPie.constants';
import type { PieFrame, SliceMap } from '../HudPixelPie.type';
import { buildSliceMap, pushOffset } from './slice-map';

/** The shaded band sits one colour step under the slice body, and never under the shade itself. */
const rimOf = (body: number): number => Math.max(INK.shade, body - 1);

/** Colour of one slice cell: deep under the digits, a step down on the shaded band, else the body. */
const inkOf = (body: number, map: SliceMap, cell: number): number => {
  if (map.hub[cell] === 1) return INK.deep;
  return map.rim[cell] === 1 ? rimOf(body) : body;
};

/** Quarters of a leaving slice still drawn at |step|: all four at the first step, one at the last. */
const quartersKept = (step: number): number => EXIT_STEPS + 1 - step;

const drawLeaving = (grid: Uint8Array, map: SliceMap, index: number, step: number): void => {
  const { gridSize, sliceCount, owner } = map;
  const [dx, dy] = pushOffset(index, sliceCount, step);
  const kept = quartersKept(step);
  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const cell = y * gridSize + x;
      if (owner[cell] !== index || DITHER[y & 1][x & 1] >= kept) continue;
      const tx = x + dx;
      const ty = y + dy;
      if (tx < 0 || ty < 0 || tx >= gridSize || ty >= gridSize) continue;
      grid[ty * gridSize + tx] = inkOf(INK.bright, map, cell);
    }
  }
};

const rasterizePie = (frame: PieFrame, sliceMap?: SliceMap): Uint8Array => {
  const { gridSize, sliceCount, slicesLeft, leavingStep, pulseStep } = frame;
  const map = sliceMap ?? buildSliceMap(gridSize, sliceCount);
  const count = map.sliceCount;
  const gone = count - Math.min(Math.max(0, Math.floor(slicesLeft)), count);
  const nextBody = PULSE_LEVELS[((pulseStep % PULSE_LEVELS.length) + PULSE_LEVELS.length) % PULSE_LEVELS.length];
  const grid = new Uint8Array(gridSize * gridSize);

  for (let cell = 0; cell < grid.length; cell += 1) {
    const index = map.owner[cell];
    if (map.outline[cell] === 1) grid[cell] = INK.outline;
    else if (map.backing[cell] === 1 || (index >= 0 && index < gone)) grid[cell] = INK.backing;
    else if (index >= 0) grid[cell] = inkOf(index === gone ? nextBody : INK.lit, map, cell);
  }

  const step = Math.floor(leavingStep);
  if (gone > 0 && step >= 1 && step <= EXIT_STEPS) drawLeaving(grid, map, gone - 1, step);
  return grid;
};

export { rasterizePie };
