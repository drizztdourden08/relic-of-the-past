/* @layer shared-game @kind types */
import type { BasedOn } from '@shared/store/based-on';

type OutfitId = 'green' | 'blue' | 'red' | 'bunny';

type GloveLevel = 0 | 1 | 2;

type OutfitPalette = readonly number[];

interface SheetPalette {
  outfits: Record<OutfitId, OutfitPalette>;
  gloves: readonly [number, number];
}

interface PaletteOverride {
  outfits?: Partial<Record<OutfitId, OutfitPalette>>;
  gloves?: readonly [number, number];
}

interface Wearing {
  outfit: OutfitId;
  gloves: GloveLevel;
}

interface SheetMeta {
  name: string;
  author: string;
  authorShort: string;
  notes?: string;
  basedOn?: BasedOn;
}

interface PlayerSheet {
  pixels: Uint8Array;
  original: SheetPalette;
  override: PaletteOverride;
  meta: SheetMeta;
}

export type { OutfitId, GloveLevel, OutfitPalette, SheetPalette, PaletteOverride, Wearing, SheetMeta, PlayerSheet };
