/* @layer shared-asset-extraction @kind logic */
import { packArrays } from '../asset-builder/pack-arrays';
import { extractJapaneseFont } from '../japanese/font/extract-japanese-font';
import type { RomData } from '../rom/rom-types';
import { buildJapaneseTilemapFont } from '../screens/japanese/build-japanese-tilemap-font';
import { JA_GFX_DIALOGUE_FONT_ID, JA_GFX_TILEMAP_FONT_ID } from './japanese-graphics.constants';
import type { JapaneseGraphicEntry } from './japanese-graphics.type';

// The dialogue font in the asset blob's own [sheet, widths] layout, so the core points its dialogue font
// block straight at it, and the 512-tile tilemap font the credits and the Japanese file select upload.
const japaneseFontEntries = (rom: RomData): JapaneseGraphicEntry[] => {
  const font = extractJapaneseFont(rom);
  return [
    { id: JA_GFX_DIALOGUE_FONT_ID, bytes: Uint8Array.from(packArrays([Buffer.from(font.sheet), Buffer.from(font.widths)])) },
    { id: JA_GFX_TILEMAP_FONT_ID, bytes: buildJapaneseTilemapFont(font.sheet) },
  ];
};

export { japaneseFontEntries };
