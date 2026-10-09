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

interface DialogGroundLook {
  color: string;
  opacity: number;
}

interface DialogBorderLook {
  kind: DialogBorder;
  thickness: DialogBorderThickness;
  color: string;
  corner: DialogCorner;
  mark: DialogCornerMark;
  markAngle: number;
}

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
  bordered: boolean;
  tile: number;
  spritesBase: string;
  ground: DialogGroundLook;
  feathered: boolean;
  border: DialogBorderLook;
  texture: DialogTextureLook;
  children?: ReactNode;
}

export type { CssRect, DialogBoxProps, DialogBorderLook, DialogGroundLook, DialogTextureLook };
