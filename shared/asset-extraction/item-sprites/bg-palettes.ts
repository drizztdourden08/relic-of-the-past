/* @layer shared-asset-extraction @kind logic */
/**
 * Background palette assembly. Builds the eight 16-colour rows a map tile is drawn with.
 *
 * The hardware palette for a background is built from several ROM tables at
 * once, and the split is the thing worth knowing: a background sheet is stored
 * 3bpp (eight pixel values), and the loader widens it to 4bpp either into the
 * LOWER half of a row (values 1-7) or the UPPER half (values 9-15). Which half a
 * sheet lands in is a property of the VRAM slot it was loaded into, so the two
 * halves come from *different* tables and must both be assembled here.
 *
 * Outdoors: rows 2-6 take their lower half from the main table (one 35-word set
 * per palette mode), row 7 takes its from the third auxiliary table, and the
 * upper halves come from the shared auxiliary table, rows 2-4 from one index and
 * rows 5-7 from another. Indoors is simpler: one 90-word set gives rows 2-7
 * their full 15 colours.
 *
 * Pixel value 0 is never written by any of them because it is the backdrop
 * showing through, so every row keeps a transparent entry there.
 */
import type { RomData } from '../rom/rom-types';
import type { RGBA } from '../graphics/palette';
import { snesToRgba, TRANSPARENT } from '../graphics/palette';
import {
  ADDR_DUNGEON_BG_MAIN, ADDR_OVERWORLD_BG_AUX12,
  ADDR_OVERWORLD_BG_AUX3, ADDR_OVERWORLD_BG_MAIN,
} from '../data/constants';

/** Eight rows of sixteen colours, indexed `[row][pixelValue]`. */
type BgPaletteRows = RGBA[][];

/** Which auxiliary index feeds a row's upper half: the first covers rows 2-4. */
const auxIndexFor = (row: number, aux1: number, aux2: number): number => (row <= 4 ? aux1 : aux2);

const emptyRows = (): BgPaletteRows =>
  Array.from({ length: 8 }, () => Array.from({ length: 16 }, () => TRANSPARENT));

const readColors = (rom: RomData, addr: number, count: number): RGBA[] =>
  rom.getWords(addr, count).map(word => snesToRgba(word));

const writeInto = (row: RGBA[], first: number, colors: RGBA[]): void => {
  for (let i = 0; i < colors.length; i += 1) row[first + i] = colors[i];
};

/**
 * Outdoor rows for one palette mode plus its three auxiliary selections.
 * `aux3` only reaches row 7's lower half; `aux1`/`aux2` only the upper halves.
 */
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

/** Indoor rows. One set index fills rows 2-7 with fifteen colours each. */
const dungeonBgPalette = (rom: RomData, index: number): BgPaletteRows => {
  const rows = emptyRows();
  for (let row = 2; row <= 7; row += 1) {
    writeInto(rows[row], 1, readColors(rom, ADDR_DUNGEON_BG_MAIN + (index * 90 + (row - 2) * 15) * 2, 15));
  }
  return rows;
};

export { dungeonBgPalette, overworldBgPalette };
export type { BgPaletteRows };
