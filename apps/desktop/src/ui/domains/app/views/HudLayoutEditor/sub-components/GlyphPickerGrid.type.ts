/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { GlyphPack } from '@rotp/input-mapping';
import type { HudGlyphPosition } from '@rotp/hud';

interface GlyphPickerGridProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  packs: readonly GlyphPack[];
  onClose: () => void;
  onPick: (params: { position: HudGlyphPosition; pack?: string }) => void;
}

export type { GlyphPickerGridProps };
