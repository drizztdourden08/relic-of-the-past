/* @layer shared-asset-extraction @kind logic */
import { decompressGbaLz77 } from '../../compression/gba-lz77';
import { convertGbaSheetToSnes4bpp } from '../../graphics/gba-native';
import { gbaAddressToOffset } from '../../rom/gba-rom';
import type { GbaRomReader } from '../../rom/gba-rom';

interface SheetSource {
  address: number;
  firstTile: number;
}

interface DungeonSpriteGraphics {
  enemyBlockset: number;
  tilesetIndex: number;
  sheetIds: readonly number[];
}

interface SpriteSheet {
  id: number;
  sourceAddress: number;
  snes4bpp: Buffer;
}

interface SpritePaletteSource {
  bank: number;
  address: number;
}

const PALACE_SHEETS: readonly SheetSource[] = [
  { address: 0x08258e38, firstTile: 0 },
  { address: 0x082592e0, firstTile: 64 },
  { address: 0x0825e200, firstTile: 128 },
  { address: 0x0825c910, firstTile: 192 },
  { address: 0x0825d4a8, firstTile: 256 },
  { address: 0x08264ccc, firstTile: 320 },
  { address: 0x08261c50, firstTile: 384 },
  { address: 0x0825d9e4, firstTile: 448 },
];
const DUNGEON_PALETTE_BASE = 0x083be018;
const DUNGEON_PALETTE_SIZE = 0xc0;
const SPRITE_SHEET_POINTER_TABLE = 0x0822b314;
const SPRITE_TILESET_TABLE = 0x0822b624;
const PALACE_SPRITE_PALETTES: readonly SpritePaletteSource[] = [
  { bank: 17, address: 0x083bd7d8 },
  { bank: 18, address: 0x083bd7f8 },
  { bank: 19, address: 0x083bd818 },
  { bank: 20, address: 0x083b56ec },
  { bank: 23, address: 0x083bd8f8 },
  { bank: 24, address: 0x083bf858 },
  { bank: 25, address: 0x083bf878 },
  { bank: 26, address: 0x083bf898 },
];

const loadSheet = (rom: GbaRomReader, address: number): Buffer => {
  const data = decompressGbaLz77(rom, gbaAddressToOffset(address)).data;
  if (data.length !== 0x800) throw new Error(`Palace sheet at 0x${address.toString(16)} is not 64 tiles`);
  return data;
};

const extractPalaceSnes4bppTiles = (rom: GbaRomReader): Buffer => {
  const packed = Buffer.alloc(512 * 32);
  for (const source of PALACE_SHEETS) loadSheet(rom, source.address).copy(packed, source.firstTile * 32);

  const animatedSlot6 = loadSheet(rom, 0x08276ff0);
  animatedSlot6.copy(packed, 432 * 32, 32 * 32, 48 * 32);
  const animatedSlot7 = loadSheet(rom, 0x08276c38);
  animatedSlot7.copy(packed, 448 * 32, 32 * 32, 48 * 32);
  return convertGbaSheetToSnes4bpp(packed);
};

const extractDungeonPalette = (rom: GbaRomReader, paletteId: number): Buffer => {
  if (!Number.isInteger(paletteId) || paletteId < 0 || paletteId > 0xff) throw new Error('Invalid dungeon palette ID');
  return Buffer.from(rom.romSlice(DUNGEON_PALETTE_BASE + (paletteId >>> 1) * DUNGEON_PALETTE_SIZE, DUNGEON_PALETTE_SIZE));
};

const extractDungeonSpriteGraphics = (
  rom: GbaRomReader,
  enemyBlocksets: readonly number[],
): { tilesets: DungeonSpriteGraphics[]; sheets: SpriteSheet[] } => {
  const tilesets = [...new Set(enemyBlocksets)].sort((a, b) => a - b).map(enemyBlockset => {
    const tilesetIndex = enemyBlockset + 0x40;
    const sheetIds = [...rom.romSlice(SPRITE_TILESET_TABLE + tilesetIndex * 4, 4)];
    return { enemyBlockset, tilesetIndex, sheetIds };
  });
  const usedSheetIds = [...new Set(tilesets.flatMap(tileset => tileset.sheetIds))]
    .filter(sheetId => sheetId !== 0xff)
    .sort((a, b) => a - b);
  const sheets = usedSheetIds.map(id => {
    const sourceAddress = rom.romUint32(SPRITE_SHEET_POINTER_TABLE + id * 4);
    const packed = decompressGbaLz77(rom, gbaAddressToOffset(sourceAddress)).data;
    if (packed.length !== 0x800) throw new Error(`Sprite sheet ${id} at 0x${sourceAddress.toString(16)} is not 64 tiles`);
    return { id, sourceAddress, snes4bpp: convertGbaSheetToSnes4bpp(packed) };
  });
  return { tilesets, sheets };
};

const extractPalaceSpritePalettes = (rom: GbaRomReader): { bank: number; address: number; bgr555: Buffer }[] => (
  PALACE_SPRITE_PALETTES.map(source => ({ ...source, bgr555: Buffer.from(rom.romSlice(source.address, 32)) }))
);

export {
  DUNGEON_PALETTE_BASE,
  DUNGEON_PALETTE_SIZE,
  PALACE_SHEETS,
  PALACE_SPRITE_PALETTES,
  SPRITE_SHEET_POINTER_TABLE,
  SPRITE_TILESET_TABLE,
  extractDungeonPalette,
  extractDungeonSpriteGraphics,
  extractPalaceSnes4bppTiles,
  extractPalaceSpritePalettes,
};
export type { DungeonSpriteGraphics, SheetSource, SpritePaletteSource, SpriteSheet };
