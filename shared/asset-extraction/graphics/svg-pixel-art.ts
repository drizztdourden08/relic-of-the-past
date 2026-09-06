/* @layer shared-asset-extraction @kind logic */
/**
 * Pixel-art SVG → ImageBuffer. Reads the one dialect our own drawings use: a
 * `viewBox` sized in pixels and a flat list of `<rect>` elements with integer
 * geometry and hex fills. Anything else in the document is ignored, so a
 * drawing tool's extra attributes do no harm. No XML library: the shape is
 * narrow enough for two regular expressions.
 */
import { ImageBuffer } from './png-writer';
import type { RGBA } from './palette';

const VIEWBOX_RE = /\bviewBox="\s*-?\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?\s+(\d+)\s+(\d+)\s*"/;
const RECT_RE = /<rect\b([^>]*?)\/?>/g;

const attributeOf = (attributes: string, name: string): string | undefined =>
  new RegExp(`\\b${name}="([^"]*)"`).exec(attributes)?.[1];

const integerAttribute = (attributes: string, name: string, fallback: number): number => {
  const raw = attributeOf(attributes, name);
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value)) throw new Error(`pixel-art SVG: <rect ${name}="${raw}"> is not an integer`);
  return value;
};

/** `#rgb` or `#rrggbb` → opaque RGBA. */
const hexToRgba = (hex: string): RGBA => {
  const digits = hex.trim().replace(/^#/, '');
  const wide = digits.length === 3 ? [...digits].map((d) => d + d).join('') : digits;
  if (!/^[0-9a-fA-F]{6}$/.test(wide)) throw new Error(`pixel-art SVG: unsupported fill "${hex}"`);
  const channel = (at: number) => parseInt(wide.slice(at, at + 2), 16);
  return [channel(0), channel(2), channel(4), 255];
};

const fillRect = (image: ImageBuffer, x: number, y: number, width: number, height: number, color: RGBA): void => {
  const x0 = Math.max(0, x);
  const y0 = Math.max(0, y);
  const x1 = Math.min(image.width, x + width);
  const y1 = Math.min(image.height, y + height);
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) image.putPixel(px, py, color);
  }
};

const parsePixelArtSvg = (svg: string): ImageBuffer => {
  const box = VIEWBOX_RE.exec(svg);
  if (!box) throw new Error('pixel-art SVG: missing or non-integer viewBox');
  const image = new ImageBuffer(Number(box[1]), Number(box[2]));
  for (const match of svg.matchAll(RECT_RE)) {
    const attributes = match[1];
    const fill = attributeOf(attributes, 'fill');
    if (fill === undefined || fill === 'none') continue;
    fillRect(
      image,
      integerAttribute(attributes, 'x', 0),
      integerAttribute(attributes, 'y', 0),
      integerAttribute(attributes, 'width', 0),
      integerAttribute(attributes, 'height', 0),
      hexToRgba(fill),
    );
  }
  return image;
};

export { hexToRgba, parsePixelArtSvg };
