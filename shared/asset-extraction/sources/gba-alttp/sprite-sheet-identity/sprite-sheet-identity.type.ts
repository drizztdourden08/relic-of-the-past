/* @layer shared-asset-extraction @kind types */
interface SheetMatch {
  cartridgeId: number;
  baseId: number;
  matchingTiles: number;
}

interface CartridgeSpriteSheet {
  id: number;
  snes4bpp: Buffer;
}

export type { CartridgeSpriteSheet, SheetMatch };
