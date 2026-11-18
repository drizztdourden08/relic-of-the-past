/* @layer shared-game @kind logic */
import type { ScreenPayload, ScreenTable } from '@rotp/asset-extraction';
import {
  COPY_SCREEN_ID, CREDITS_DIGITS_ID, CREDITS_MAP_ID, CREDITS_OFFSETS_ID, CREDITS_SCROLL_Y_ID, CREDITS_TEXT_ID, DUNGEON_MAP_LABELS_ID,
  ENDING_CAPTION_DATA_ID, ENDING_CAPTION_OFFSETS_ID, FLOOR_LABELS_ID, NAME_GRID_ID, PAUSE_HEADERS_ID, PAUSE_TABLES,
  SELECT_FILE_TABLES, TILEMAP_FONT_DATA_ID, TILEMAP_FONT_ID, menuTilemapId, pauseTableId, selectFileTableId, sheetPatchTableId, sheetTableId,
} from '@rotp/asset-extraction';

const bytesOfWords = (words: Uint16Array): Uint8Array =>
  new Uint8Array(words.buffer, words.byteOffset, words.byteLength);

const fixedTables = (screens: ScreenPayload): ScreenTable[] => [
  { id: NAME_GRID_ID, bytes: screens.nameGrid },
  { id: DUNGEON_MAP_LABELS_ID, bytes: bytesOfWords(screens.dungeonMapLabels) },
  { id: CREDITS_DIGITS_ID, bytes: bytesOfWords(screens.creditsDigits) },
  { id: ENDING_CAPTION_OFFSETS_ID, bytes: bytesOfWords(screens.endingCaptions.offsets) },
  { id: ENDING_CAPTION_DATA_ID, bytes: screens.endingCaptions.data },
  { id: CREDITS_TEXT_ID, bytes: screens.credits.text },
  { id: CREDITS_OFFSETS_ID, bytes: bytesOfWords(screens.credits.offsets) },
  { id: CREDITS_MAP_ID, bytes: bytesOfWords(screens.credits.map) },
  { id: TILEMAP_FONT_ID, bytes: Uint8Array.of(screens.tilemapFont) },
];

const patchTable = (patch: ScreenPayload['sheetPatches'][number]): ScreenTable => ({
  id: sheetPatchTableId(patch.index),
  bytes: Uint8Array.from([patch.tiles.length, ...patch.tiles, ...patch.data]),
});

const fontTables = (screens: ScreenPayload): ScreenTable[] =>
  screens.tilemapFontData ? [{ id: TILEMAP_FONT_DATA_ID, bytes: screens.tilemapFontData }] : [];

const scrollTables = (screens: ScreenPayload): ScreenTable[] =>
  screens.creditsScrollY ? [{ id: CREDITS_SCROLL_Y_ID, bytes: bytesOfWords(screens.creditsScrollY) }] : [];

const latinTables = (screens: ScreenPayload): ScreenTable[] => [
  ...(screens.pauseHeaders ? [{ id: PAUSE_HEADERS_ID, bytes: bytesOfWords(screens.pauseHeaders) }] : []),
  ...(screens.floorLabels ? [{ id: FLOOR_LABELS_ID, bytes: screens.floorLabels }] : []),
  ...(screens.copyScreen ? [{ id: COPY_SCREEN_ID, bytes: screens.copyScreen }] : []),
];

const compileScreens = (screens?: ScreenPayload): ScreenTable[] => {
  if (!screens) return [];
  return [
    ...screens.menuTilemaps.map((bytes, index) => ({ id: menuTilemapId(index), bytes })),
    ...SELECT_FILE_TABLES.map((table) => ({ id: selectFileTableId(table), bytes: screens.selectFileStripes[table] })),
    ...PAUSE_TABLES.map((table) => ({ id: pauseTableId(table), bytes: bytesOfWords(screens.pauseText[table]) })),
    ...fixedTables(screens),
    ...fontTables(screens),
    ...scrollTables(screens),
    ...latinTables(screens),
    ...screens.sheetPatches.map(patchTable),
    ...screens.sheets.map((sheet) => ({ id: sheetTableId(sheet.kind, sheet.index), bytes: sheet.data })),
  ];
};

export { compileScreens };
