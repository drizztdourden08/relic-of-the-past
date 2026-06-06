/**
 * SNES 15-bit color palette conversion.
 *
 * SNES color format: 0bBBBBBGGGGGRRRRR (15-bit, little-endian word)
 * Each component is 5 bits (0-31), scaled to 8-bit (0-255).
 */

/** RGBA tuple [r, g, b, a] where each component is 0-255 */
type RGBA = [number, number, number, number];

const snesToRgba = (color: number): RGBA => {
  const r = color & 0x1f;
  const g = (color >>> 5) & 0x1f;
  const b = (color >>> 10) & 0x1f;
  return [
    (r << 3) | (r >>> 2),
    (g << 3) | (g >>> 2),
    (b << 3) | (b >>> 2),
    255,
  ];
};

/** Transparent pixel constant */
const TRANSPARENT: RGBA = [0, 0, 0, 0];

const loadPalette = (words: number[], transparentIndex = 0): RGBA[] => {
  return words.map((w, i) =>
    i === transparentIndex ? TRANSPARENT : snesToRgba(w)
  );
};

export { TRANSPARENT, loadPalette, snesToRgba };
export type { RGBA };
