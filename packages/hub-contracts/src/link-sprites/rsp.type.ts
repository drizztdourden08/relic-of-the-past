/* @layer shared-storage @kind types */
import type { OutfitPalette, SheetPalette, PaletteOverride, SheetMeta } from '@rotp/game-data';

interface RspSource {
  kind: 'zspr' | 'stock' | 'rsp';
  name: string;
}

interface RspExtras {
  electro?: OutfitPalette;
  sword?: readonly number[];
  shield?: readonly number[];
}

interface RspManifest {
  format: 'rsp';
  version: number;
  meta: SheetMeta;
  palettes: {
    original: SheetPalette;
    override: PaletteOverride;
  };
  extras?: RspExtras;
  source?: RspSource;
}

export { MANIFEST_ENTRY } from './rsp.constants';
export type { RspSource, RspExtras, RspManifest };
