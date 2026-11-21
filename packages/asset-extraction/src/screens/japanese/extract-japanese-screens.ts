/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../rom/rom-types';
import type { JaScreenAddressTable } from '../addresses/ja.type';
import { extractEndText } from '../end-text/extract-end-text';
import { readByteRegion } from '../read-byte-region';
import { readStripeTable } from '../read-stripe-table';
import { readWordRegion } from '../read-word-region';
import { readWordTables } from '../read-word-tables';
import type { ScreenPayload, SelectFileTable } from '../screen-payload.type';
import { OWN_FONT_INDEX, SELECT_FILE_TABLES } from '../screens.constants';
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

const extractJapaneseScreens = (rom: RomData, table: JaScreenAddressTable): ScreenPayload => ({
  menuTilemaps: menuTilemaps(rom, table),
  selectFileStripes: selectFileStripes(rom, table),
  nameGrid: readByteRegion(rom, { address: table.nameGridAddress, count: JA_NAME_GRID_BYTES }),
  ...readWordTables(rom, table),
  creditsScrollY: readWordRegion(rom, table.creditsScrollY),
  ...extractEndText(rom, table),
  sheets: [],
  sheetPatches: [],
  tilemapFont: OWN_FONT_INDEX,
});

export { extractJapaneseScreens };
