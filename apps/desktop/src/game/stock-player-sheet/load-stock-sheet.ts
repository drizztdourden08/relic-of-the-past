/* @layer renderer-lib @kind logic */
import type { PlayerSheet } from '@rotp/game-data';
import { readDatEntry } from '@rotp/asset-extraction';
import { SHEET_BYTES } from '@rotp/game-data';
import { loadAssets } from '@app/storage/assets-store';
import { stockPaletteFrom, TILES_KEY } from '@rotp/packs';

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
