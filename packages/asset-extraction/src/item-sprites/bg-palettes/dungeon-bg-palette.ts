/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { emptyRows } from './empty-rows';
import { readColors } from './read-colors';
import { writeInto } from './write-into';
import type { SpriteSource } from '../sources';
import type { BgPaletteRows } from './bg-palettes.type';

const dungeonBgPalette = (source: SpriteSource, index: number): BgPaletteRows => {
  const rows = emptyRows();
  for (let row = 2; row <= 7; row += 1) {
    writeInto(itemAt(rows, row, 'BG palette row'), 1, readColors(source, 'dungeonBg', index * 90 + (row - 2) * 15, 15));
  }
  return rows;
};

export { dungeonBgPalette };
