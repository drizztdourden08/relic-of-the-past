/* @layer renderer-lib @kind logic */
import type { PlayerSheet } from '@shared/game/data/player-sheet/types';
import { readDatEntry } from '@shared/asset-extraction/dat-reader';
import { SHEET_BYTES } from '@shared/game/data/player-sheet/types';
import { loadAssets } from '@app/lib/storage/assets-store';
import { stockPaletteFrom } from './stock-palette-from';
import { TILES_KEY } from './stock-player-sheet.constants';

const loadStockSheet = async (romFile: string): Promise<PlayerSheet | null> => {
  const buffer = await loadAssets(romFile);
  if (!buffer) return null;
  const dat = new Uint8Array(buffer);
  const tiles = readDatEntry(dat, TILES_KEY);
  const palette = stockPaletteFrom(dat);
  if (!tiles || tiles.length < SHEET_BYTES || !palette) return null;
  return {
    pixels: tiles.slice(0, SHEET_BYTES),
    original: palette,
    override: {},
    meta: { name: '', author: '', authorShort: '' },
  };
};

export { loadStockSheet };
