/* @layer shared-asset-extraction @kind types */
import type { Oklab } from '../graphics/oklab';
import type { RGBA } from '../graphics/palette';

interface PoolTone { key: number; color: RGBA; lab: Oklab; count: number; pictures: number; share: number }

interface ForeignIconPalette {
  words: number[];
  row: RGBA[];
}

export type { ForeignIconPalette, PoolTone };
