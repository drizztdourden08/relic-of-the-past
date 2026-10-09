/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import { hexToRgba } from '../../graphics/svg-pixel-art';
import type { RGBA } from '../../graphics/palette';
import type { ColorSwap } from './palette-swap.type';

const rgbaKey = (color: RGBA): string => color.join(',');

const swapColors = (base: ImageBuffer, colors: readonly ColorSwap[]): ImageBuffer => {
  const map = new Map(colors.map(({ from, to }) => [rgbaKey(hexToRgba(from)), hexToRgba(to)]));
  const seen = new Set<string>();
  const out = new ImageBuffer(base.width, base.height);
  for (let y = 0; y < base.height; y++) {
    for (let x = 0; x < base.width; x++) {
      const pixel = base.getPixel(x, y);
      const key = rgbaKey(pixel);
      const swapped = map.get(key);
      if (swapped !== undefined) seen.add(key);
      out.putPixel(x, y, swapped ?? pixel);
    }
  }
  const unused = colors.filter(({ from }) => !seen.has(rgbaKey(hexToRgba(from))));
  if (unused.length > 0) throw new Error(`palette-swap: base has no ${unused.map(({ from }) => from).join(', ')} pixel`);
  return out;
};

export { swapColors };
