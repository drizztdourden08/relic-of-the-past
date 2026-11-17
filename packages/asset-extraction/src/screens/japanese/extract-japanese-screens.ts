/* @layer shared-asset-extraction @kind logic */
import { extractJapaneseFont } from '../../japanese/font/extract-japanese-font';
import type { RomData } from '../../rom/rom-types';
import type { JaScreenAddressTable } from '../addresses/ja.type';
import { extractEndText } from '../end-text/extract-end-text';
import { readSheet } from '../read-sheet';
import { readWordRegion } from '../read-word-region';
import type { PauseTable, ScreenPayload, SelectFileTable } from '../screen-payload.type';
import { OWN_FONT_INDEX, PAUSE_TABLES, SELECT_FILE_TABLES } from '../screens.constants';
import { buildJapaneseTilemapFont } from './build-japanese-tilemap-font';

const usSelectFile = (): Record<SelectFileTable, Uint8Array> =>
  Object.fromEntries(SELECT_FILE_TABLES.map((id) => [id, new Uint8Array(0)])) as Record<SelectFileTable, Uint8Array>;

const extractJapaneseScreens = (rom: RomData, table: JaScreenAddressTable): ScreenPayload => ({
  menuTilemaps: [],
  selectFileStripes: usSelectFile(),
  nameGrid: new Uint8Array(0),
  pauseText: Object.fromEntries(
    PAUSE_TABLES.map((id) => [id, readWordRegion(rom, table.pauseText[id])]),
  ) as Record<PauseTable, Uint16Array>,
  dungeonMapLabels: readWordRegion(rom, table.dungeonMapLabels),
  creditsDigits: readWordRegion(rom, table.creditsDigits),
  creditsScrollY: readWordRegion(rom, table.creditsScrollY),
  ...extractEndText(rom, table),
  sheets: [
    ...table.sheets.spr.map((index) => readSheet(rom, table, 'spr', index)),
    ...table.sheets.bg.map((index) => readSheet(rom, table, 'bg', index)),
  ],
  sheetPatches: [],
  tilemapFont: OWN_FONT_INDEX,
  tilemapFontData: buildJapaneseTilemapFont(extractJapaneseFont(rom).sheet),
});

export { extractJapaneseScreens };
