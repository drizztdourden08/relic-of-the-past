/* @layer shared-asset-extraction @kind types */
import type { RGBA } from '../../graphics/palette';

interface Legend {
  vram: Uint16Array;
  palette: RGBA[];
}

export type { Legend };
