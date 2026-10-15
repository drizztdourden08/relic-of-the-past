/* @layer renderer-hud @kind types */
import type { ReactNode } from 'react';
import type { DialogBorder, DialogBorderThickness, DialogCorner, DialogCornerMark, DialogTexture, DialogTextureAnimation, DialogTextureSpeed } from '@rotp/game-data';

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

interface BorderTilesProps {
  rect: CssRect;
  tile: number;
  spritesBase: string;
  onFail: () => void;
}

export type { BorderTilesProps, CssRect, DialogBoxProps, DialogBorderLook };
