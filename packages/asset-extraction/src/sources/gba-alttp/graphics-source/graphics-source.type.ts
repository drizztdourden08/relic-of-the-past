/* @layer shared-asset-extraction @kind types */
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

interface DungeonSpriteGraphicsSet {
  tilesets: DungeonSpriteGraphics[];
  sheets: SpriteSheet[];
}

interface PalaceSpritePalette {
  bank: number;
  address: number;
  bgr555: Buffer;
}

export type {
  DungeonSpriteGraphicsSet,
  PalaceSpritePalette,
  SheetSource,
  SpritePaletteSource,
};
