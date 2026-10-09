/* @layer shared-asset-extraction @kind logic */
import { TRANSPARENT } from '../../graphics/palette';
import type { BgPaletteRows } from './bg-palettes.type';

const emptyRows = (): BgPaletteRows =>
  Array.from({ length: 8 }, () => Array.from({ length: 16 }, () => TRANSPARENT));

export { emptyRows };
