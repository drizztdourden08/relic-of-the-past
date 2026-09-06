/* @layer shared-asset-extraction @kind logic */
/**
 * A 16×16 picture as the four SNES 4bpp tiles of the core's animated-tile decode slot,
 * quantized to ONE fixed sprite palette row.
 *
 * Both in-game binaries the extraction emits are built this way — the capacity upgrade
 * icons (capacity-icons.ts) and the gear pictures (gear-icons.ts) — because both solve
 * the same problem the same way: the core copies the tiles over the decode slot at
 * 0xBD40 and forces the draw's OAM palette row to the row they were quantized to, so
 * nothing writes CGRAM and the picture cannot pick up whatever the row happens to hold.
 *
 * The tile order is the slot's own: top-left, top-right, bottom-left, bottom-right,
 * 32 B each (see core/game-hooks/decode_slot.h). Index 0 is transparent; every opaque
 * pixel snaps to the nearest of the row's colours by squared RGB distance.
 */
import type { ImageBuffer } from '../graphics/png-writer';
import type { RGBA } from '../graphics/palette';

/** The side of the decode slot's picture, in pixels. */
const SLOT_SIDE = 16;
/** One SNES 4bpp 8×8 tile. */
const TILE_BYTES = 32;
/** The whole slot: four tiles. */
const SLOT_BYTES = 4 * TILE_BYTES;

interface QuantizedIcon {
  /** 16×16 palette indices, row-major; 0 = transparent. */
  indices: Uint8Array;
  /** Mean squared RGB distance per opaque pixel — how well the row fits the picture. */
  error: number;
}

const squaredDistance = (a: RGBA, b: RGBA): number =>
  (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

/** The nearest opaque colour of `row` (1-15) for a pixel; 0 for a transparent pixel. */
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

/** One 8×8 tile as SNES 4bpp planar bytes: planes 0/1 interleaved per row, then planes 2/3. */
const encodeTile = (indices: Uint8Array, ox: number, oy: number, out: Uint8Array, offset: number): void => {
  for (let y = 0; y < 8; y++) {
    const planes = [0, 0, 0, 0];
    for (let x = 0; x < 8; x++) {
      const index = indices[(oy + y) * SLOT_SIDE + ox + x];
      const bit = 7 - x;
      for (let p = 0; p < 4; p++) planes[p] |= ((index >> p) & 1) << bit;
    }
    out[offset + y * 2] = planes[0];
    out[offset + y * 2 + 1] = planes[1];
    out[offset + 16 + y * 2] = planes[2];
    out[offset + 17 + y * 2] = planes[3];
  }
};

const TILE_ORIGINS: readonly [number, number][] = [[0, 0], [8, 0], [0, 8], [8, 8]];

const encodeIcon = (indices: Uint8Array): Uint8Array => {
  const out = new Uint8Array(SLOT_BYTES);
  TILE_ORIGINS.forEach(([ox, oy], tile) => encodeTile(indices, ox, oy, out, tile * TILE_BYTES));
  return out;
};

/** The indices moved `dx` pixels left, the columns that fall off the right edge transparent. */
const shiftIndicesLeft = (indices: Uint8Array, dx: number): Uint8Array => {
  const out = new Uint8Array(indices.length);
  for (let y = 0; y < SLOT_SIDE; y++) {
    for (let x = 0; x + dx < SLOT_SIDE; x++) out[y * SLOT_SIDE + x] = indices[y * SLOT_SIDE + x + dx];
  }
  return out;
};

const isSlotSized = (picture: ImageBuffer): boolean =>
  picture.width === SLOT_SIDE && picture.height === SLOT_SIDE;

export { encodeIcon, isSlotSized, quantizeIcon, shiftIndicesLeft, SLOT_BYTES, SLOT_SIDE, TILE_BYTES };
export type { QuantizedIcon };
