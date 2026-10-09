/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { GlyphPack, HudGlyphPosition } from '@shared/types/hud';

interface GlyphPickerGridProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  packs: readonly GlyphPack[];
  onClose: () => void;
  onPick: (params: { position: HudGlyphPosition; pack?: string }) => void;
}

export type { GlyphPickerGridProps };
