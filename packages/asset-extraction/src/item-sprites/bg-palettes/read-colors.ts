/* @layer shared-asset-extraction @kind logic */
import { snesToRgba } from '../../graphics/palette';
import type { PaletteTable, SpriteSource } from '../sources';
import type { RGBA } from '../../graphics/palette';

const readColors = (source: SpriteSource, table: PaletteTable, firstWord: number, count: number): RGBA[] =>
  source.readPaletteWords(table, firstWord, count).map(word => snesToRgba(word));

export { readColors };
