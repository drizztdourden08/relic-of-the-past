/* @layer renderer-components @kind types */
import type { GlyphPack, HudButtonFace } from '@shared/types/hud';

interface ButtonStateRowProps {
  state: string;
  required?: boolean;
  face: HudButtonFace | undefined;
  glyphPacks: readonly GlyphPack[];
  onChange: (next: HudButtonFace | undefined) => void;
}

export type { ButtonStateRowProps };
