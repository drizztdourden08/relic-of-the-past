/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import { jaScreenAddressesOf } from '../screens/addresses';
import type { JaScreenAddressTable, JaSpriteLayoutSource } from '../screens/addresses/ja.type';
import { readSheet } from '../screens/read-sheet';
import { readSheetPatch } from '../screens/read-sheet-patch';
import { readStripeTable } from '../screens/read-stripe-table';
import { PAUSE_TABLES } from '../screens/screens.constants';
import { JA_COPYRIGHT_SHEET, JA_COPYRIGHT_TILES } from '../screens/japanese/japanese-screens.constants';
import {
  JA_GFX_BG_BASE, JA_GFX_COPYRIGHT_OAM_ID, JA_GFX_HUD_SPR_SHEETS, JA_GFX_HUD_TEXT_BASE, JA_GFX_INTRO_BG_SHEETS, JA_GFX_INTRO_TILEMAP_ID, JA_GFX_OAM_ENTRY_BYTES,
  JA_GFX_PATCH_BASE,
  JA_GFX_PLATE_OAM_ID,
  JA_GFX_SPR_BASE,
  JA_GFX_TITLE_PALETTES_ID,
  JA_GFX_TITLE_PARAMS_BYTES,
  JA_GFX_TITLE_PARAMS_ID,
} from './japanese-graphics.constants';
import type { JapaneseGraphicEntry } from './japanese-graphics.type';

const copyrightPatch = (rom: RomData, table: JaScreenAddressTable): JapaneseGraphicEntry => {
  const patch = readSheetPatch(rom, table, { index: JA_COPYRIGHT_SHEET, tiles: JA_COPYRIGHT_TILES });
  return { id: JA_GFX_PATCH_BASE + JA_COPYRIGHT_SHEET, bytes: Uint8Array.from([patch.tiles.length, ...patch.tiles, ...patch.data]) };
};

const spriteLayout = (rom: RomData, id: number, source: JaSpriteLayoutSource): JapaneseGraphicEntry => {
  const { table: oam, startX, startY } = source;
  const entries = rom.getBytes(oam.address, oam.count * JA_GFX_OAM_ENTRY_BYTES);
  return { id, bytes: Uint8Array.from([oam.count, rom.getByte(startX), rom.getByte(startY), ...entries]) };
};

const titlePalettes = (rom: RomData, table: JaScreenAddressTable): JapaneseGraphicEntry => ({
  id: JA_GFX_TITLE_PALETTES_ID,
  bytes: Uint8Array.from(table.titlePalettes.flatMap((region) => [...rom.getBytes(region.address, region.count * 2)])),
});

const pauseWordsOfHudSheets = (rom: RomData, table: JaScreenAddressTable): JapaneseGraphicEntry[] =>
  PAUSE_TABLES.map((name, i) => {
    const region = table.pauseText[name];
    return { id: JA_GFX_HUD_TEXT_BASE + i, bytes: Uint8Array.from(rom.getBytes(region.address, region.count * 2)) };
  });

const titleParams = (rom: RomData, table: JaScreenAddressTable): JapaneseGraphicEntry => ({
  id: JA_GFX_TITLE_PARAMS_ID,
  bytes: rom.getBytes(table.titleYLimit, JA_GFX_TITLE_PARAMS_BYTES),
});

const compileJapaneseGraphics = (rom: RomData): JapaneseGraphicEntry[] => {
  if (rom.language !== 'ja') throw new Error('Japanese graphics come from a Japanese ROM.');
  const table = jaScreenAddressesOf(rom.revision);
  return [
    { id: JA_GFX_INTRO_TILEMAP_ID, bytes: Uint8Array.from(readStripeTable(rom, table.menuTilemaps[0] ?? 0)) },
    ...JA_GFX_INTRO_BG_SHEETS.map((index) => ({
      id: JA_GFX_BG_BASE + index,
      bytes: readSheet(rom, table, 'bg', index).data,
    })),
    ...JA_GFX_HUD_SPR_SHEETS.map((index) => ({
      id: JA_GFX_SPR_BASE + index,
      bytes: readSheet(rom, table, 'spr', index).data,
    })),
    ...pauseWordsOfHudSheets(rom, table),
    copyrightPatch(rom, table),
    spriteLayout(rom, JA_GFX_COPYRIGHT_OAM_ID, table.copyrightOam),
    spriteLayout(rom, JA_GFX_PLATE_OAM_ID, table.plateOam),
    titleParams(rom, table),
    titlePalettes(rom, table),
  ];
};

export { compileJapaneseGraphics };
