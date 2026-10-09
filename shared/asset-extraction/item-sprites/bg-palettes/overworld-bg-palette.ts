/* @layer shared-asset-extraction @kind logic */
import { ADDR_OVERWORLD_BG_AUX12, ADDR_OVERWORLD_BG_AUX3, ADDR_OVERWORLD_BG_MAIN } from '../../data/constants';
import { emptyRows } from './empty-rows';
import { readColors } from './read-colors';
import { writeInto } from './write-into';
import type { RomData } from '../../rom/rom-types';
import type { BgPaletteRows } from './bg-palettes.type';

const auxIndexFor = (row: number, aux1: number, aux2: number): number => (row <= 4 ? aux1 : aux2);

const overworldBgPalette = (
  rom: RomData, mode: number, aux1: number, aux2: number, aux3: number,
): BgPaletteRows => {
  const rows = emptyRows();
  for (let row = 2; row <= 6; row += 1) {
    writeInto(rows[row], 1, readColors(rom, ADDR_OVERWORLD_BG_MAIN + (mode * 35 + (row - 2) * 7) * 2, 7));
  }
  writeInto(rows[7], 1, readColors(rom, ADDR_OVERWORLD_BG_AUX3 + aux3 * 7 * 2, 7));
  for (let row = 2; row <= 7; row += 1) {
    const offset = auxIndexFor(row, aux1, aux2) * 21 + ((row - 2) % 3) * 7;
    writeInto(rows[row], 9, readColors(rom, ADDR_OVERWORLD_BG_AUX12 + offset * 2, 7));
  }
  return rows;
};

export { overworldBgPalette };
