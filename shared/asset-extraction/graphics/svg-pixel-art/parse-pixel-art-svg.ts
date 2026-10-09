/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../png-writer';
import type { RGBA } from '../palette';
import { hexToRgba } from './hex-to-rgba';
import { RECT_RE, VIEWBOX_RE } from './svg-pixel-art.constants';

const attributeOf = (attributes: string, name: string): string | undefined =>
  new RegExp(`\\b${name}="([^"]*)"`).exec(attributes)?.[1];

const integerAttribute = (attributes: string, name: string, fallback: number): number => {
  const raw = attributeOf(attributes, name);
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value)) throw new Error(`pixel-art SVG: <rect ${name}="${raw}"> is not an integer`);
  return value;
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

export { parsePixelArtSvg };
