/* @layer shared-asset-extraction @kind logic */
import { SLOT_SIDE } from './fixed-row-tiles.constants';
import type { ImageBuffer } from '../../graphics/png-writer';
import type { RGBA } from '../../graphics/palette';
import type { QuantizedIcon } from './fixed-row-tiles.type';

const squaredDistance = (a: RGBA, b: RGBA): number =>
  (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

const nearestRowIndex = (pixel: RGBA, row: readonly RGBA[]): number => {
  if (pixel[3] === 0) return 0;
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let i = 1; i < 16; i++) {
    const color = row[i];
    if (color === undefined || color[3] === 0) continue;
    const distance = squaredDistance(pixel, color);
    if (distance < bestDistance) { best = i; bestDistance = distance; }
  }
  return best;
};

const quantizeIcon = (picture: ImageBuffer, row: readonly RGBA[]): QuantizedIcon => {
  const indices = new Uint8Array(SLOT_SIDE * SLOT_SIDE);
  let error = 0;
  let opaque = 0;
  for (let y = 0; y < SLOT_SIDE; y++) {
    for (let x = 0; x < SLOT_SIDE; x++) {
      const pixel = picture.getPixel(x, y);
      const index = nearestRowIndex(pixel, row);
      indices[y * SLOT_SIDE + x] = index;
      if (index === 0) continue;
      error += squaredDistance(pixel, row[index]);
      opaque += 1;
    }
  }
  return { indices, error: opaque === 0 ? 0 : error / opaque };
};

export { quantizeIcon };
