/* @layer shared-asset-extraction @kind types */
interface BgTileRequest {
  sheets: number[];
  upper: number[];
  tiles: number[];
  paletteSet: 'overworld' | 'dungeon';
  paletteIndex: number;
  paletteAux: number[];
}

export type { BgTileRequest };
