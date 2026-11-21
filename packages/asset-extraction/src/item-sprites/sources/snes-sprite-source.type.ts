/* @layer shared-asset-extraction @kind types */
import type { PaletteTable, SheetKind } from './sprite-source.type';

interface SnesSpriteAddresses {
  readonly id: string;
  readonly sheetAddress: (kind: SheetKind, index: number) => number;
  readonly palettes: Readonly<Record<PaletteTable, number>>;
  readonly dialogueFontTile: number | null;
  readonly titleStripes: number;
  readonly polyPalette: number;
  readonly legendStripes: number;
}

export type { SnesSpriteAddresses };
