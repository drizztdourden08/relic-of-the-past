/* @layer renderer-components @kind types */
import type { GlyphPack } from '@rotp/input-mapping';
import type { HudButtonSpec } from '@rotp/hud';

interface ButtonContentProps {
  spec: HudButtonSpec;
  onChange: (patch: Partial<HudButtonSpec>) => void;
  glyphPacks: readonly GlyphPack[];
}

export type { ButtonContentProps };
