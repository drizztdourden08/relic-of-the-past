/* @layer shared-asset-extraction @kind types */
interface SheetSlot {
  vram: number;
  sheet: number;
  high: boolean;
}

interface PaletteLoad {
  rom: number;
  dst: number;
  count: number;
  rows: number;
}

interface SpritePiece {
  char: number;
  x: number;
  y: number;
  flipX?: boolean;
}

interface TriforcePieceAnchor {
  x: number;
  y: number;
  flipX: boolean;
}

export type { PaletteLoad, SheetSlot, SpritePiece, TriforcePieceAnchor };
