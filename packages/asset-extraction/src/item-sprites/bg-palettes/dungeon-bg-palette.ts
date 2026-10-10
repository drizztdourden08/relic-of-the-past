/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { ADDR_DUNGEON_BG_MAIN } from '../../data/constants';
import { emptyRows } from './empty-rows';
import { readColors } from './read-colors';
import { writeInto } from './write-into';
import type { RomData } from '../../rom/rom-types';
import type { BgPaletteRows } from './bg-palettes.type';

const dungeonBgPalette = (rom: RomData, index: number): BgPaletteRows => {
  const rows = emptyRows();
  for (let row = 2; row <= 7; row += 1) {
    writeInto(itemAt(rows, row, 'BG palette row'), 1, readColors(rom, ADDR_DUNGEON_BG_MAIN + (index * 90 + (row - 2) * 15) * 2, 15));
  }
  return rows;
};

export { dungeonBgPalette };
