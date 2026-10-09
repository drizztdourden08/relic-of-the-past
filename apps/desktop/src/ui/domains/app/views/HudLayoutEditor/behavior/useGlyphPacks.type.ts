/* @layer renderer-components @kind types */
import type { GlyphPosition } from '@app/lib/hud/custom-glyph-store';
import type { GlyphPack } from '@rotp/input-mapping';

interface GlyphPacks {
  packs: readonly GlyphPack[];
  custom: readonly GlyphPack[];
  version: number;
  busy: boolean;
  createPack: (name: string) => Promise<GlyphPack | null>;
  deletePack: (packId: string) => Promise<void>;
  importImage: (packId: string, position: GlyphPosition, file: File) => Promise<void>;
  removeImage: (packId: string, position: GlyphPosition) => Promise<void>;
}

export type { GlyphPacks };
