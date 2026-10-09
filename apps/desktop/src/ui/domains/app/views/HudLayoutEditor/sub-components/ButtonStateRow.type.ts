/* @layer renderer-components @kind types */
import type { GlyphPack } from '@rotp/input-mapping';
import type { HudButtonFace } from '@rotp/hud';

interface ButtonStateRowProps {
  state: string;
  required?: boolean;
  face: HudButtonFace | undefined;
  glyphPacks: readonly GlyphPack[];
  onChange: (next: HudButtonFace | undefined) => void;
}

export type { ButtonStateRowProps };
