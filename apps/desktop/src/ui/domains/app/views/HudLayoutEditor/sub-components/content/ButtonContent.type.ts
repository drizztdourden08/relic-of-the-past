/* @layer renderer-components @kind types */
import type { GlyphPack, HudButtonSpec } from '@shared/types/hud';

interface ButtonContentProps {
  spec: HudButtonSpec;
  onChange: (patch: Partial<HudButtonSpec>) => void;
  glyphPacks: readonly GlyphPack[];
}

export type { ButtonContentProps };
