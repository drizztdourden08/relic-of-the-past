/* @layer renderer-lib @kind types */
import type { DialogTexture, DialogTextureAnimation, DialogTextureSpeed } from '@shared/game/dialog/box-style';

interface TextureFrame {
  texture: DialogTexture;
  color: string;
  opacity: number;
  animation: DialogTextureAnimation;
  speed: DialogTextureSpeed;
  scale: number;
  density: number;
  scatter: number;
  t: number;
  widthPx: number;
  heightPx: number;
  devicePx: number;
}

export type { TextureFrame };
