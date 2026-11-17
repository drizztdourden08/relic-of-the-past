/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import { kFontTypes } from '../text/data/font-data';
import { readByteRegion } from './read-byte-region';
import { readWordRegion } from './read-word-region';
import { readSheet } from './read-sheet';
import { readStripeTable } from './read-stripe-table';
import type { PauseTable, ScreenAddressTable, ScreenPayload, SelectFileTable } from './screen-payload.type';
import { OWN_FONT_INDEX, PAUSE_TABLES, SELECT_FILE_TABLES, TILEMAP_FONT_BYTES } from './screens.constants';

const readSheets = (rom: RomData, table: ScreenAddressTable): ScreenPayload['sheets'] => [
  ...table.sheets.spr.map((index) => readSheet(rom, table, 'spr', index)),
  ...table.sheets.bg.map((index) => readSheet(rom, table, 'bg', index)),
];

const readFontTiles = (rom: RomData, id: string): Uint8Array | undefined => {
  const source = kFontTypes[id];
  return source ? Uint8Array.from(rom.getBytes(source.tileAddr, TILEMAP_FONT_BYTES)) : undefined;
};

const extractScreens = (rom: RomData, table: ScreenAddressTable): ScreenPayload => ({
  menuTilemaps: table.menuTilemaps.map((address) => Uint8Array.from(readStripeTable(rom, address))),
  selectFileStripes: Object.fromEntries(
    SELECT_FILE_TABLES.map((id) => [id, readByteRegion(rom, table.selectFile[id])]),
  ) as Record<SelectFileTable, Uint8Array>,
  nameGrid: Uint16Array.from(readByteRegion(rom, table.nameGrid)),
  pauseText: Object.fromEntries(
    PAUSE_TABLES.map((id) => [id, readWordRegion(rom, table.pauseText[id])]),
  ) as Record<PauseTable, Uint16Array>,
  dungeonMapLabels: readWordRegion(rom, table.dungeonMapLabels),
  endingCaptions: {
    offsets: readWordRegion(rom, table.endingCaptions.offsets),
    data: readByteRegion(rom, table.endingCaptions.data),
  },
  credits: {
    text: readByteRegion(rom, table.credits.text),
    offsets: readWordRegion(rom, table.credits.offsets),
    map: readWordRegion(rom, table.credits.map),
  },
  sheets: readSheets(rom, table),
  tilemapFont: OWN_FONT_INDEX,
  tilemapFontData: readFontTiles(rom, table.id),
});

export { extractScreens };
