/* @layer shared-asset-extraction @kind types */
import type { RomData } from '../../rom/rom-types';

type SheetKind = 'spr' | 'bg';

type PaletteTable =
  | 'hud' | 'spriteMain' | 'spriteAux1' | 'spriteAux3' | 'sword' | 'shield' | 'armor'
  | 'dungeonBg' | 'overworldMain' | 'overworldAux12' | 'overworldAux3';

interface SpriteSource {
  readonly id: string;
  readonly rom: RomData;
  readonly titleStripes: number;
  readonly polyPalette: number;
  readonly legendStripes: number;
  readSheet: (kind: SheetKind, index: number) => Buffer;
  readDialogueFont: () => Buffer | null;
  readPaletteWords: (table: PaletteTable, firstWord: number, count: number) => number[];
}

export type { PaletteTable, SheetKind, SpriteSource };
