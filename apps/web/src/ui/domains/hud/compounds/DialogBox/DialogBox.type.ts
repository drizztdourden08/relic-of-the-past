/* @layer renderer-hud @kind types */
import type { ReactNode } from 'react';
import type {
  DialogBorder, DialogBorderThickness, DialogCorner, DialogCornerMark,
  DialogTexture, DialogTextureAnimation, DialogTextureSpeed,
} from '@shared/game/dialog/box-style';

interface CssRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The fill behind the text. */
interface DialogGroundLook {
  color: string;
  /** 0..1 */
  opacity: number;
}

/** The border around the text and the marks inside its corners. */
interface DialogBorderLook {
  kind: DialogBorder;
  thickness: DialogBorderThickness;
  color: string;
  corner: DialogCorner;
  mark: DialogCornerMark;
  /** Degrees the top-left mark turns; the others mirror it. */
  markAngle: number;
}

/** The repeating pattern on the ground. */
interface DialogTextureLook {
  texture: DialogTexture;
  color: string;
  opacity: number;
  animation: DialogTextureAnimation;
  speed: DialogTextureSpeed;
  scale: number;
  density: number;
  scatter: number;
}

interface DialogBoxProps {
  rect: CssRect;
  /** False for a floating message, which draws only its ground. */
  bordered: boolean;
  /** One game tile in CSS pixels. */
  tile: number;
  spritesBase: string;
  ground: DialogGroundLook;
  /** Fade the ground out toward its edges; ignored under a border. */
  feathered: boolean;
  border: DialogBorderLook;
  texture: DialogTextureLook;
  children?: ReactNode;
}

export type { CssRect, DialogBoxProps, DialogBorderLook, DialogGroundLook, DialogTextureLook };
