/* @layer renderer-hud @kind types */
import type { DialogTexture as DialogTextureKind, DialogTextureAnimation, DialogTextureSpeed } from '@rotp/game-data';

interface DialogTextureProps {
  width: number;
  height: number;
  unit: number;
  texture: DialogTextureKind;
  color: string;
  opacity: number;
  animation: DialogTextureAnimation;
  speed: DialogTextureSpeed;
  scale: number;
  density: number;
  scatter: number;
}

export type { DialogTextureProps };
