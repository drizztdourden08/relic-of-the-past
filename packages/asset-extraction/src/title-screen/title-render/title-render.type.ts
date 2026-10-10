/* @layer shared-asset-extraction @kind types */
import type { RGBA } from '../../graphics/palette';

interface TitleSource {
  vram: Uint16Array;
  palette: RGBA[];
}

interface TilePlacement {
  addr: number;
  row: number;
  x: number;
  y: number;
  flipX: boolean;
  flipY: boolean;
}

export type { TilePlacement, TitleSource };
