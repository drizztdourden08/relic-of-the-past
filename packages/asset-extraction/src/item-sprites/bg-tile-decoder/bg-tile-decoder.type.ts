/* @layer shared-asset-extraction @kind types */
import type { RGBA } from '../../graphics/palette';

interface BgTileRequest {
  sheets: number[];
  upper: number[];
  tiles: number[];
  paletteSet: 'overworld' | 'dungeon';
  paletteIndex: number;
  paletteAux: number[];
}

interface BgQuadrant {
  pixels: Uint8Array;
  word: number;
  row: RGBA[];
  base: number;
  at: [number, number];
}

export type { BgQuadrant, BgTileRequest };
