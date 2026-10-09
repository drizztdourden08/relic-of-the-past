/* @layer shared-storage @kind types */
import type { OutfitPalette, SheetPalette, PaletteOverride, SheetMeta } from '@shared/game/data/player-sheet/types';

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

export { RSP_VERSION, MANIFEST_ENTRY, SHEET_ENTRY, PREVIEW_ENTRY } from './rsp.constants';
export type { RspSource, RspExtras, RspManifest };
