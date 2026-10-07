/* @layer shared-game @kind logic */
/**
 * A `#rrggbb` colour as the game's 15-bit colour word (5 bits a channel, red
 * lowest), each channel snapped to the nearest of its 32 levels. The core
 * draws highlighted letters with this word, and the host box paints with the
 * same word expanded back, so both boxes show one colour.
 */

const CHANNEL_MAX = 31;
const BYTE_MAX = 255;

const channel = (hex: string, at: number): number => {
  const value = Number.parseInt(hex.slice(at, at + 2), 16);
  return Math.round(((Number.isNaN(value) ? 0 : value) * CHANNEL_MAX) / BYTE_MAX);
};

const hexToSnes15 = (hex: string): number => {
  const digits = hex.replace(/^#/, '');
  return channel(digits, 0) | (channel(digits, 2) << 5) | (channel(digits, 4) << 10);
};

export { hexToSnes15 };
