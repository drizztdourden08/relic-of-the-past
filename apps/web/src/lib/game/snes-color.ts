/* @layer renderer-lib @kind logic */
/**
 * SNES colour words, as the palette editor needs them.
 *
 * The hardware stores a colour as BGR555 — one little-endian word laid out
 * `0bbbbbgg gggrrrrr`, five bits per channel. Only 32 levels per channel exist, so a
 * value a colour picker hands back has to be quantised before it is believed: otherwise
 * the swatch shows a colour the console cannot produce.
 *
 * The 5-to-8 bit expansion replicates the high bits into the low ones rather than
 * multiplying by 8, so a full 5-bit channel reaches 255 instead of stopping at 248 —
 * which is what lets a hex value survive a round trip through the picker unchanged.
 */

const CHANNEL_MAX = 31;

const to8 = (v: number): number => ((v & CHANNEL_MAX) << 3) | ((v & CHANNEL_MAX) >> 2);
const to5 = (v: number): number => (v >> 3) & CHANNEL_MAX;

const hexByte = (v: number): string => v.toString(16).padStart(2, '0');

/** BGR555 word -> `#rrggbb`. */
const bgr555ToHex = (word: number): string => {
  const r = to8(word);
  const g = to8(word >> 5);
  const b = to8(word >> 10);
  return `#${hexByte(r)}${hexByte(g)}${hexByte(b)}`;
};

/** `#rrggbb` (or `rrggbb`) -> BGR555 word, quantised to the 5-bit grid. */
const hexToBgr555 = (hex: string): number => {
  const n = parseInt(hex.replace(/^#/, ''), 16) || 0;
  return to5(n >> 16) | (to5(n >> 8) << 5) | (to5(n) << 10);
};

/** BGR555 word -> packed little-endian RGBA, for writing straight into ImageData. */
const bgr555ToRgba = (word: number): number => {
  const r = to8(word);
  const g = to8(word >> 5);
  const b = to8(word >> 10);
  return (0xff << 24) | (b << 16) | (g << 8) | r;
};

/** False when a hex value is off the 5-bit grid, i.e. the editor had to snap it. */
const isExactColor = (hex: string): boolean => {
  const normalized = `#${(parseInt(hex.replace(/^#/, ''), 16) || 0).toString(16).padStart(6, '0')}`;
  return bgr555ToHex(hexToBgr555(normalized)) === normalized;
};

export { bgr555ToHex, hexToBgr555, bgr555ToRgba, isExactColor };
