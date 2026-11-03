/* @layer shared-asset-extraction @kind types */
import type { DropSheets } from '../drop-sprite-assembly';
import type { SpritePalettes } from '../receipt-palettes';

type ShieldTiles = {
  sheetId: number;
  tileIds: number[];
};

type DrawShieldOptions = {
  shield: ShieldTiles;
  paletteIdx: number;
  spritePalettes: SpritePalettes;
  dropSheets: DropSheets;
  positions: readonly (readonly [number, number])[];
};

export type { DrawShieldOptions, ShieldTiles };
