/* @layer renderer-components @kind types */
import type { GlyphPack, HudElementSpec } from '@shared/types/hud';

interface SlotContentProps {
  spec: Extract<HudElementSpec, { type: 'slot' }>;
  onChange: (patch: Partial<Extract<HudElementSpec, { type: 'slot' }>>) => void;
  glyphPacks: readonly GlyphPack[];
}

export type { SlotContentProps };
