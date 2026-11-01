/* @layer renderer-components @kind types */
import type { GlyphPosition } from '@app/hud/custom-glyph-store';
import type { GlyphPack } from '@rotp/input-mapping';
import type { GlyphOverrideActions } from './glyph-overrides.type';

interface PackOverridesPanelProps extends GlyphOverrideActions {
  pack: GlyphPack;
  positions: readonly GlyphPosition[];
  target: GlyphPosition | undefined;
  busy: boolean;
  onPosition: (position: GlyphPosition) => void;
}

export type { PackOverridesPanelProps };
