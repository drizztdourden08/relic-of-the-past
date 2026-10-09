/* @layer shared-asset-extraction @kind logic */
import { swapColors } from './swap-colors';
import type { ImageBuffer } from '../../graphics/png-writer';
import type { BaseResolver } from '../base-resolver.type';
import type { PaletteSwapDef } from './palette-swap.type';

const extractPaletteSwap = (def: PaletteSwapDef, resolve: BaseResolver): ImageBuffer => {
  const { baseFile, colors } = def;
  if (colors.length === 0) throw new Error('palette-swap needs at least one colour pair');
  const base = resolve(baseFile);
  if (!base) throw new Error(`base sprite ${baseFile} produced no picture`);
  return swapColors(base, colors);
};

export { extractPaletteSwap };
