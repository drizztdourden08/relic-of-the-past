/* @layer shared-asset-extraction @kind logic */
/**
 * sRGB to OKLab (Bjorn Ottosson, 2020): a colour space where equal distances look about
 * equally different, and where lightness (L) and colourfulness (chroma, the length of a/b)
 * are separate axes. A plain RGB distance has neither property: it can call a mid grey
 * closer to a mid green than to a dark grey.
 */
import type { RGBA } from './palette';

/** [L, a, b]: L from 0 (black) to 1 (white); a and b near 0 for a grey. */
type Oklab = [number, number, number];

/** One 0-255 sRGB channel as linear light. */
const toLinear = (channel: number): number => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const toOklab = (color: RGBA): Oklab => {
  const r = toLinear(color[0]);
  const g = toLinear(color[1]);
  const b = toLinear(color[2]);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

/** How colourful a colour is: 0 for a grey, about 0.1 to 0.3 for a saturated hue. */
const chromaOf = (lab: Oklab): number => Math.hypot(lab[1], lab[2]);

export { chromaOf, toOklab };
export type { Oklab };
