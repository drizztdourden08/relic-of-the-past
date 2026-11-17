/* @layer shared-asset-extraction @kind logic */
import { decompress } from '../../compression/lz-decompress';
import type { RomData } from '../../rom/rom-types';
import { FONT_TILE_BYTES } from '../../text/data/font-data';
import type { SnesSpriteAddresses } from './snes-sprite-source.type';
import { RAW_SPRITE_SHEET_BYTES, RAW_SPRITE_SHEET_COUNT } from './sprite-source.constants';
import type { SpriteSource } from './sprite-source.type';

const createSnesSpriteSource = (rom: RomData, addresses: SnesSpriteAddresses): SpriteSource => ({
  id: addresses.id,
  rom,
  titleStripes: addresses.titleStripes,
  polyPalette: addresses.polyPalette,
  legendStripes: addresses.legendStripes,
  readSheet: (kind, index) => {
    const address = addresses.sheetAddress(kind, index);
    return kind === 'spr' && index < RAW_SPRITE_SHEET_COUNT
      ? rom.getBytes(address, RAW_SPRITE_SHEET_BYTES)
      : decompress(address, (addr) => rom.getByte(addr), false);
  },
  readDialogueFont: () =>
    addresses.dialogueFontTile === null ? null : rom.getBytes(addresses.dialogueFontTile, FONT_TILE_BYTES),
  readPaletteWords: (table, firstWord, count) => rom.getWords(addresses.palettes[table] + firstWord * 2, count),
});

export { createSnesSpriteSource };
