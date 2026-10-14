/* @layer renderer-components @kind types */
import type { GlyphPack } from '@rotp/input-mapping';
import type { HudNode } from '@rotp/hud';

interface InsertMenusProps {
  insert: (node: HudNode) => void;
  slotNumbers: readonly number[];
  glyphPacks: readonly GlyphPack[];
  openKey: string | null;
  onToggle: (key: string) => void;
  onClose: () => void;
}

export type { InsertMenusProps };
