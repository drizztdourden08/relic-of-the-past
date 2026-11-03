/* @layer renderer-components @kind types */
import type { GlyphPosition } from '@app/hud/custom-glyph-store';

interface GlyphOverrideActions {
  onDeletePack: (packId: string) => void;
  onImport: (packId: string, position: GlyphPosition, file: File) => void;
  onRemove: (packId: string, position: GlyphPosition) => void;
}

export type { GlyphOverrideActions };
