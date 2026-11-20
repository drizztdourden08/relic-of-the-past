/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import { kFontTypes } from '../text/data/font-data';
import { readByteRegion } from './read-byte-region';
import { readWordRegion } from './read-word-region';
import { extractEndText } from './end-text/extract-end-text';
import { readSheet } from './read-sheet';
import { readCopyScreen } from './read-copy-screen';
import { readPauseHeaders } from './read-pause-headers';
import { readSheetPatch } from './read-sheet-patch';
import { readStripeTable } from './read-stripe-table';
import { rebaseStripes } from './rebase-stripes';
import type { FloorLabelTiles, PauseTable, ScreenAddressTable, ScreenPayload, SelectFileTable } from './screen-payload.type';
import { OWN_FONT_INDEX, PAUSE_TABLES, SELECT_FILE_TABLES, TILEMAP_FONT_BYTES } from './screens.constants';

const readSheets = (rom: RomData, table: ScreenAddressTable): ScreenPayload['sheets'] => [
  ...table.sheets.spr.map((index) => readSheet(rom, table, 'spr', index)),
  ...table.sheets.bg.map((index) => readSheet(rom, table, 'bg', index)),
];

const readFontTiles = (rom: RomData, table: ScreenAddressTable): Uint8Array | undefined => {
  const source = table.tilemapRebase ? kFontTypes[table.id] : undefined;
  return source ? Uint8Array.from(rom.getBytes(source.tileAddr, TILEMAP_FONT_BYTES)) : undefined;
};

const floorLabelBytes = (tiles: FloorLabelTiles | undefined): Uint8Array | undefined =>
  tiles ? Uint8Array.of(tiles.basementPrefix, tiles.upperSuffix, ...tiles.ground) : undefined;

const extractScreens = (rom: RomData, table: ScreenAddressTable): ScreenPayload => ({
  menuTilemaps: table.menuTilemaps.map((address) => rebaseStripes(readStripeTable(rom, address), table.tilemapRebase)),
  selectFileStripes: Object.fromEntries(
    SELECT_FILE_TABLES.map((id) => [id, rebaseStripes(readByteRegion(rom, table.selectFile[id]), table.tilemapRebase)]),
  ) as Record<SelectFileTable, Uint8Array>,
  nameGrid: readByteRegion(rom, table.nameGrid),
  pauseText: Object.fromEntries(
    PAUSE_TABLES.map((id) => [id, readWordRegion(rom, table.pauseText[id])]),
  ) as Record<PauseTable, Uint16Array>,
  dungeonMapLabels: readWordRegion(rom, table.dungeonMapLabels),
  creditsDigits: readWordRegion(rom, table.creditsDigits),
  ...extractEndText(rom, table),
  sheets: readSheets(rom, table),
  sheetPatches: table.sheetPatches.map((source) => readSheetPatch(rom, table, source)),
  tilemapFont: OWN_FONT_INDEX,
  tilemapFontData: readFontTiles(rom, table),
  pauseHeaders: readPauseHeaders(rom, table.pauseHeaders),
  floorLabels: floorLabelBytes(table.floorLabels),
  copyScreen: readCopyScreen(rom, table.copyScreen),
  hudLifeRow: table.hudLifeRow ? readWordRegion(rom, table.hudLifeRow) : undefined,
});

export { extractScreens };
