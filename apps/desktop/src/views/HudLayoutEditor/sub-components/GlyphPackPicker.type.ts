/* @layer renderer-components @kind types */
import type { GlyphPosition } from '@app/hud/custom-glyph-store';
import type { GlyphPack } from '@rotp/input-mapping';
import type { GlyphOverrideActions } from './glyph-overrides.type';

interface GlyphPackPickerProps extends GlyphOverrideActions {
  value: string;
  packs: readonly GlyphPack[];
  custom: readonly GlyphPack[];
  positions: readonly GlyphPosition[];
  busy: boolean;
  onChange: (packId: string) => void;
  onCreatePack: () => void;
}

export type { GlyphPackPickerProps };
