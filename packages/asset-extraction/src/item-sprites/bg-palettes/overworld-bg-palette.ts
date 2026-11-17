/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import type { RGBA } from '../../graphics/palette';
import { emptyRows } from './empty-rows';
import { readColors } from './read-colors';
import { writeInto } from './write-into';
import type { SpriteSource } from '../sources';
import type { BgPaletteRows, OverworldBgSelection } from './bg-palettes.type';

const auxIndexFor = (row: number, aux1: number, aux2: number): number => (row <= 4 ? aux1 : aux2);

const overworldBgPalette = (source: SpriteSource, selection: OverworldBgSelection): BgPaletteRows => {
  const { mode, aux1, aux2, aux3 } = selection;
  const rows = emptyRows();
  const rowAt = (row: number): RGBA[] => itemAt(rows, row, 'BG palette row');
  for (let row = 2; row <= 6; row += 1) {
    writeInto(rowAt(row), 1, readColors(source, 'overworldMain', mode * 35 + (row - 2) * 7, 7));
  }
  writeInto(rowAt(7), 1, readColors(source, 'overworldAux3', aux3 * 7, 7));
  for (let row = 2; row <= 7; row += 1) {
    const offset = auxIndexFor(row, aux1, aux2) * 21 + ((row - 2) % 3) * 7;
    writeInto(rowAt(row), 9, readColors(source, 'overworldAux12', offset, 7));
  }
  return rows;
};

export { overworldBgPalette };
