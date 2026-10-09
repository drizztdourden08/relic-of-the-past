/* @layer shared-asset-extraction @kind logic */
import type { RGBA } from '../palette';

const hexToRgba = (hex: string): RGBA => {
  const digits = hex.trim().replace(/^#/, '');
  const wide = digits.length === 3 ? [...digits].map((d) => d + d).join('') : digits;
  if (!/^[0-9a-fA-F]{6}$/.test(wide)) throw new Error(`pixel-art SVG: unsupported fill "${hex}"`);
  const channel = (at: number) => parseInt(wide.slice(at, at + 2), 16);
  return [channel(0), channel(2), channel(4), 255];
};

export { hexToRgba };
