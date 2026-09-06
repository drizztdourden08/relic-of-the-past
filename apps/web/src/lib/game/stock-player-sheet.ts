/* @layer renderer-lib @kind logic */
/**
 * The sheet the game ships with, for starting a custom sprite from scratch.
 *
 * Both halves come out of a ROM's already-compiled asset blob, not from the ROM or
 * a running game: the tiles are one named entry, and the gear palette is another. That
 * keeps "create new" available with no game running and no re-extraction, at the cost of
 * needing a ROM whose assets have been built once.
 *
 * The gear asset holds five outfits. Only the first four are taken: the fifth is the flash
 * palette used while the player is zapped, which no sheet format carries and which the
 * core deliberately leaves on the shared row.
 */
import { readDatEntry } from '@shared/asset-extraction/dat-reader';
import { COLORS_PER_OUTFIT, OUTFIT_IDS, SHEET_BYTES } from '@shared/game/data/player-sheet/types';
import type { OutfitId, OutfitPalette, SheetPalette, PlayerSheet } from '@shared/game/data/player-sheet/types';
import { STOCK_GLOVES } from '@shared/game/data/player-sheet/stock-palette';
import { loadAssets } from '@app/lib/storage/assets-store';

const TILES_KEY = 'kLinkGraphics';
const GEAR_PALETTE_KEY = 'kPalette_ArmorAndGloves';

const paletteFromWords = (words: Uint8Array): SheetPalette | null => {
  if (words.length < OUTFIT_IDS.length * COLORS_PER_OUTFIT * 2) return null;
  const outfits = {} as Record<OutfitId, OutfitPalette>;
  OUTFIT_IDS.forEach((id, slot) => {
    const colors: number[] = [];
    for (let i = 0; i < COLORS_PER_OUTFIT; i++) {
      const at = (slot * COLORS_PER_OUTFIT + i) * 2;
      colors.push(words[at] | (words[at + 1] << 8));
    }
    outfits[id] = colors;
  });
  return { outfits, gloves: STOCK_GLOVES };
};

/** Pulls the stock palette alone, to stand in for a sheet that ships tiles only. */
const stockPaletteFrom = (dat: Uint8Array): SheetPalette | null => {
  const gear = readDatEntry(dat, GEAR_PALETTE_KEY);
  return gear ? paletteFromWords(gear) : null;
};

/** The stock sheet for one ROM, or null when its assets have not been compiled yet. */
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

export { loadStockSheet, stockPaletteFrom };
