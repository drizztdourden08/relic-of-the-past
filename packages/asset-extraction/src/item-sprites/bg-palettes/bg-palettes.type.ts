/* @layer shared-asset-extraction @kind types */
import type { RGBA } from '../../graphics/palette';

type BgPaletteRows = RGBA[][];

type OverworldBgSelection = {
  mode: number;
  aux1: number;
  aux2: number;
  aux3: number;
};

export type { BgPaletteRows, OverworldBgSelection };
