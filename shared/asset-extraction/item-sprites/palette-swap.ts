/* @layer shared-asset-extraction @kind logic */
/**
 * Palette-swap sprites: another definition's picture with a colour map applied.
 * Every pixel whose decoded RGBA equals a `from` colour becomes its `to` colour;
 * every other pixel, transparency included, is copied as is. This is how a gem
 * of a colour the game never drew is derived from one it did, keeping the tile
 * art and the outline untouched. A `from` colour the base does not hold is an
 * error: the definition names a colour that is not there, which is a typo, not
 * a no-op.
 */
import { ImageBuffer } from '../graphics/png-writer';
import { hexToRgba } from '../graphics/svg-pixel-art';
import type { RGBA } from '../graphics/palette';
import type { BaseResolver } from './base-resolver';

interface ColorSwap {
  /** `#rrggbb` of the base's colour, matched exactly. */
  from: string;
  /** `#rrggbb` it becomes. */
  to: string;
}

interface PaletteSwapDef {
  /** File name of the definition whose picture is recoloured. */
  baseFile: string;
  /** The colour pairs; at least one. */
  colors: ColorSwap[];
}

const rgbaKey = (color: RGBA): string => color.join(',');

/** A copy of `base` with every mapped colour replaced. */
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

const extractPaletteSwap = (def: PaletteSwapDef, resolve: BaseResolver): ImageBuffer => {
  const { baseFile, colors } = def;
  if (colors.length === 0) throw new Error('palette-swap needs at least one colour pair');
  const base = resolve(baseFile);
  if (!base) throw new Error(`base sprite ${baseFile} produced no picture`);
  return swapColors(base, colors);
};

export { extractPaletteSwap, swapColors };
export type { ColorSwap, PaletteSwapDef };
