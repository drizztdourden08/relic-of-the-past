/* @layer renderer-components @kind types */
import type { GlyphPosition } from '@app/lib/hud/custom-glyph-store';
import type { GlyphPack } from '@rotp/input-mapping';

interface GlyphPackPickerProps {
  value: string;
  packs: readonly GlyphPack[];
  custom: readonly GlyphPack[];
  positions: readonly GlyphPosition[];
  busy: boolean;
  onChange: (packId: string) => void;
  onCreatePack: () => void;
  onDeletePack: (packId: string) => void;
  onImport: (packId: string, position: GlyphPosition, file: File) => void;
  onRemove: (packId: string, position: GlyphPosition) => void;
}

export type { GlyphPackPickerProps };
