/**
 * SNES 15-bit color palette conversion.
 *
 * SNES color format: 0bBBBBBGGGGGRRRRR (15-bit, little-endian word)
 * Each component is 5 bits (0-31), scaled to 8-bit (0-255).
 */

/** RGBA tuple [r, g, b, a] where each component is 0-255 */
type RGBA = [number, number, number, number];

/**
 * Convert a SNES 15-bit color word to RGBA.
 * Uses the standard 5-to-8 bit expansion: (c << 3) | (c >> 2)
 */
function snesToRgba(color: number): RGBA {
  const r = color & 0x1f;
  const g = (color >>> 5) & 0x1f;
  const b = (color >>> 10) & 0x1f;
  return [
    (r << 3) | (r >>> 2),
    (g << 3) | (g >>> 2),
    (b << 3) | (b >>> 2),
    255,
  ];
}

/** Transparent pixel constant */
const TRANSPARENT: RGBA = [0, 0, 0, 0];

/**
 * Load a palette from ROM as RGBA array.
 *
 * @param words - Array of SNES 15-bit color words
 * @param transparentIndex - Which palette index is transparent (default 0)
 * @returns Array of RGBA tuples
 */
function loadPalette(words: number[], transparentIndex = 0): RGBA[] {
  return words.map((w, i) =>
    i === transparentIndex ? TRANSPARENT : snesToRgba(w)
  );
}

export { TRANSPARENT, loadPalette, snesToRgba };
export type { RGBA };
