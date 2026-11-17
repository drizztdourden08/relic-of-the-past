/* @layer shared-asset-extraction @kind types */
import type { PaletteTable } from '../item-sprites/sources';

interface SheetSlot {
  vram: number;
  sheet: number;
  high: boolean;
}

interface PaletteLoad {
  table: PaletteTable;
  first: number;
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
