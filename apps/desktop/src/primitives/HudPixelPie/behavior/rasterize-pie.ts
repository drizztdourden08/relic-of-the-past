/* @layer renderer-hud @kind logic */
import { DITHER, EXIT_STEPS, INK, PULSE_LEVELS } from '../HudPixelPie.constants';
import type { PieFrame, SliceMap } from '../HudPixelPie.type';
import { buildSliceMap } from './build-slice-map';
import { cellAt, itemAt } from '@app/checked-access';
import { pushOffset } from './push-offset';

const rimOf = (body: number): number => Math.max(INK.shade, body - 1);

const inkOf = (body: number, map: SliceMap, cell: number): number => {
  if (map.hub[cell] === 1) return INK.deep;
  return map.rim[cell] === 1 ? rimOf(body) : body;
};

const quartersKept = (step: number): number => EXIT_STEPS + 1 - step;

const drawLeaving = (grid: Uint8Array, map: SliceMap, index: number, step: number): void => {
  const { gridSize, sliceCount, owner } = map;
  const [dx, dy] = pushOffset(index, sliceCount, step);
  const kept = quartersKept(step);
  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const cell = y * gridSize + x;
      if (owner[cell] !== index || cellAt(DITHER, y & 1, x & 1) >= kept) continue;
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
  const nextBody = itemAt(PULSE_LEVELS, ((pulseStep % PULSE_LEVELS.length) + PULSE_LEVELS.length) % PULSE_LEVELS.length);
  const grid = new Uint8Array(gridSize * gridSize);

  for (let cell = 0; cell < grid.length; cell += 1) {
    const index = itemAt(map.owner, cell);
    if (map.outline[cell] === 1) grid[cell] = INK.outline;
    else if (map.backing[cell] === 1 || (index >= 0 && index < gone)) grid[cell] = INK.backing;
    else if (index >= 0) grid[cell] = inkOf(index === gone ? nextBody : INK.lit, map, cell);
  }

  const step = Math.floor(leavingStep);
  if (gone > 0 && step >= 1 && step <= EXIT_STEPS) drawLeaving(grid, map, gone - 1, step);
  return grid;
};

export { rasterizePie };
