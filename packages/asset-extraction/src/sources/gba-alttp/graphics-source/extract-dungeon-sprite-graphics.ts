/* @layer shared-asset-extraction @kind logic */
import { decompressGbaLz77 } from '../../../compression/gba-lz77';
import { convertGbaSheetToSnes4bpp } from '../../../graphics/gba-native';
import { gbaAddressToOffset } from '../../../rom/gba-rom';
import type { GbaRomReader } from '../../../rom/gba-rom';
import type { DungeonSpriteGraphicsSet } from './graphics-source.type';
import {
  ENEMY_TILESET_OFFSET, POINTER_BYTES, SHEET_BYTES, SHEETS_PER_TILESET, SPRITE_SHEET_POINTER_TABLE,
  SPRITE_TILESET_TABLE, UNUSED_SHEET,
} from './graphics-source.constants';

const extractDungeonSpriteGraphics = (
  rom: GbaRomReader,
  enemyBlocksets: readonly number[],
): DungeonSpriteGraphicsSet => {
  const tilesets = [...new Set(enemyBlocksets)].sort((a, b) => a - b).map(enemyBlockset => {
    const tilesetIndex = enemyBlockset + ENEMY_TILESET_OFFSET;
    const sheetIds = [...rom.romSlice(SPRITE_TILESET_TABLE + tilesetIndex * SHEETS_PER_TILESET, SHEETS_PER_TILESET)];
    return { enemyBlockset, tilesetIndex, sheetIds };
  });
  const usedSheetIds = [...new Set(tilesets.flatMap(tileset => tileset.sheetIds))]
    .filter(sheetId => sheetId !== UNUSED_SHEET)
    .sort((a, b) => a - b);
  const sheets = usedSheetIds.map(id => {
    const sourceAddress = rom.romUint32(SPRITE_SHEET_POINTER_TABLE + id * POINTER_BYTES);
    const packed = decompressGbaLz77(rom, gbaAddressToOffset(sourceAddress)).data;
    if (packed.length !== SHEET_BYTES) throw new Error(`Sprite sheet ${id} at 0x${sourceAddress.toString(16)} is not 64 tiles`);
    return { id, sourceAddress, snes4bpp: convertGbaSheetToSnes4bpp(packed) };
  });
  return { tilesets, sheets };
};

export { extractDungeonSpriteGraphics };
