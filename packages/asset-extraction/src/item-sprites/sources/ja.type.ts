/* @layer shared-asset-extraction @kind types */
interface JaSpriteAddressTable {
  readonly id: 'ja-v1.0' | 'ja-rev1';
  readonly sheetPointers: { readonly spr: number; readonly bg: number };
  readonly titleStripes: number;
  readonly polyPalette: number;
  readonly legendStripes: number;
}

export type { JaSpriteAddressTable };
