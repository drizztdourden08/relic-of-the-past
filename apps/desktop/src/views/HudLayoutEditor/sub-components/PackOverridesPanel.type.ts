/* @layer renderer-components @kind types */
import type { GlyphPosition } from '@app/hud/custom-glyph-store';
import type { GlyphPack } from '@rotp/input-mapping';

interface PackOverridesPanelProps {
  pack: GlyphPack;
  positions: readonly GlyphPosition[];
  target: GlyphPosition | undefined;
  busy: boolean;
  onPosition: (position: GlyphPosition) => void;
  onDeletePack: (packId: string) => void;
  onImport: (packId: string, position: GlyphPosition, file: File) => void;
  onRemove: (packId: string, position: GlyphPosition) => void;
}

export type { PackOverridesPanelProps };
