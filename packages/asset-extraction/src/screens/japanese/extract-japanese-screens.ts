/* @layer shared-asset-extraction @kind logic */
import { extractJapaneseFont } from '../../japanese/font/extract-japanese-font';
import type { RomData } from '../../rom/rom-types';
import type { JaScreenAddressTable } from '../addresses/ja.type';
import { extractEndText } from '../end-text/extract-end-text';
import { readByteRegion } from '../read-byte-region';
import { readStripeTable } from '../read-stripe-table';
import { readWordRegion } from '../read-word-region';
import type { PauseTable, ScreenPayload, SelectFileTable } from '../screen-payload.type';
import { OWN_FONT_INDEX, PAUSE_TABLES, SELECT_FILE_TABLES } from '../screens.constants';
import { buildJapaneseTilemapFont } from './build-japanese-tilemap-font';
import { JA_MENU_TILEMAP_SLOTS, JA_NAME_GRID_BYTES } from './japanese-screens.constants';

const menuTilemaps = (rom: RomData, table: JaScreenAddressTable): Uint8Array[] =>
  table.menuTilemaps.map((address, slot) =>
    JA_MENU_TILEMAP_SLOTS.includes(slot) ? Uint8Array.from(readStripeTable(rom, address)) : new Uint8Array(0),
  );

const selectFileStripes = (rom: RomData, table: JaScreenAddressTable): Record<SelectFileTable, Uint8Array> =>
  Object.fromEntries(
    SELECT_FILE_TABLES.map((id) => {
      const region = table.selectFile[id];
      return [id, region ? readByteRegion(rom, region) : new Uint8Array(0)];
    }),
  ) as Record<SelectFileTable, Uint8Array>;

// A Japanese set carries text and screen layouts only: the cartridge's pictures (the intro and HUD sheets,
// the copyright patch, the title's tilemap) come from the Japanese graphics pack (compileJapaneseGraphics).
const extractJapaneseScreens = (rom: RomData, table: JaScreenAddressTable): ScreenPayload => ({
  menuTilemaps: menuTilemaps(rom, table),
  selectFileStripes: selectFileStripes(rom, table),
  nameGrid: readByteRegion(rom, { address: table.nameGridAddress, count: JA_NAME_GRID_BYTES }),
  pauseText: Object.fromEntries(
    PAUSE_TABLES.map((id) => [id, readWordRegion(rom, table.pauseText[id])]),
  ) as Record<PauseTable, Uint16Array>,
  dungeonMapLabels: readWordRegion(rom, table.dungeonMapLabels),
  creditsDigits: readWordRegion(rom, table.creditsDigits),
  creditsScrollY: readWordRegion(rom, table.creditsScrollY),
  ...extractEndText(rom, table),
  sheets: [],
  sheetPatches: [],
  tilemapFont: OWN_FONT_INDEX,
  tilemapFontData: buildJapaneseTilemapFont(extractJapaneseFont(rom).sheet),
});

export { extractJapaneseScreens };
