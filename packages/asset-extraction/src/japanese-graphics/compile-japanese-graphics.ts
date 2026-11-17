/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import { jaScreenAddressesOf } from '../screens/addresses';
import { readSheet } from '../screens/read-sheet';
import { readSheetPatch } from '../screens/read-sheet-patch';
import { readStripeTable } from '../screens/read-stripe-table';
import { JA_COPYRIGHT_SHEET, JA_COPYRIGHT_TILES } from '../screens/japanese/japanese-screens.constants';
import {
  JA_GFX_BG_BASE, JA_GFX_HUD_SPR_SHEETS, JA_GFX_INTRO_BG_SHEETS, JA_GFX_INTRO_TILEMAP_ID, JA_GFX_PATCH_BASE,
  JA_GFX_SPR_BASE,
} from './japanese-graphics.constants';
import type { JapaneseGraphicEntry } from './japanese-graphics.type';

const compileJapaneseGraphics = (rom: RomData): JapaneseGraphicEntry[] => {
  if (rom.language !== 'ja') throw new Error('Japanese graphics come from a Japanese ROM.');
  const table = jaScreenAddressesOf(rom.revision);
  return [
    { id: JA_GFX_INTRO_TILEMAP_ID, bytes: Uint8Array.from(readStripeTable(rom, table.menuTilemaps[0])) },
    ...JA_GFX_INTRO_BG_SHEETS.map((index) => ({
      id: JA_GFX_BG_BASE + index,
      bytes: readSheet(rom, table, 'bg', index).data,
    })),
    ...JA_GFX_HUD_SPR_SHEETS.map((index) => ({
      id: JA_GFX_SPR_BASE + index,
      bytes: readSheet(rom, table, 'spr', index).data,
    })),
    {
      id: JA_GFX_PATCH_BASE + JA_COPYRIGHT_SHEET,
      bytes: readSheetPatch(rom, table, { index: JA_COPYRIGHT_SHEET, tiles: JA_COPYRIGHT_TILES }).data,
    },
  ];
};

export { compileJapaneseGraphics };
