/* @layer renderer-components @kind types */
import type { FaceArt } from '@app/hud-layout-editing/node-art';
import type { GlyphPack } from '@rotp/input-mapping';
import type { HudButtonFace } from '@rotp/hud';

interface ButtonFaceBodyProps {
  state: string;
  face: HudButtonFace;
  art: FaceArt;
  glyphPacks: readonly GlyphPack[];
  onChange: (next: HudButtonFace | undefined) => void;
}

export type { ButtonFaceBodyProps };
