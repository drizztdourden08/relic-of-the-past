/* @layer renderer-components @kind logic */

interface Rgb {
  r: number;
  g: number;
  b: number;
}

const clampChannel = (n: number): number => Math.min(255, Math.max(0, Math.round(n)));

const hexToRgb = (hex: string): Rgb => {
  const n = parseInt(hex.replace('#', ''), 16) || 0;
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
};

const rgbToHex = (rgb: Rgb): string => {
  const { r, g, b } = rgb;
  return `#${[r, g, b].map((c) => clampChannel(c).toString(16).padStart(2, '0')).join('')}`;
};

export { hexToRgb, rgbToHex, clampChannel };
export type { Rgb };
