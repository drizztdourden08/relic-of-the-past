/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../rom/rom-types';
import { snesToRgba, TRANSPARENT } from '../../graphics/palette';
import { decompress } from '../../compression/lz-decompress';
import { ADDR_HUD_PALETTE } from '../../data/constants';
import { HUD_PALETTE_BLOCK, LEGEND_SHEET, SHEET_VRAM } from './extract-legend.constants';
import type { Legend } from './extract-legend.type';
import { spriteSheetAddress } from '../../data/sprite-sheet-address';

const loadLegend = (rom: RomData): Legend => {
  const vram = new Uint16Array(0x8000);
  const sheet = decompress(spriteSheetAddress(LEGEND_SHEET), (a) => rom.getByte(a), false);
  for (let i = 0; i < sheet.length >> 1 && i < 0x400; i += 1) vram[SHEET_VRAM + i] = (sheet[i * 2] ?? 0) | ((sheet[i * 2 + 1] ?? 0) << 8);
  const words = rom.getWords(ADDR_HUD_PALETTE + HUD_PALETTE_BLOCK * 2, 32);
  return { vram, palette: words.map((w, i) => (i % 4 === 0 ? TRANSPARENT : snesToRgba(w))) };
};

export { loadLegend };
