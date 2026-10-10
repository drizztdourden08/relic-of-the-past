/* @layer renderer-lib @kind types */
import type { DialogTexture, DialogTextureAnimation, DialogTextureSpeed } from '@rotp/game-data';
import type { PatternSpec } from './patterns.type';

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

interface TextureGrid {
  pattern: PatternSpec;
  pitchX: number;
  pitchY: number;
  loose: number;
  scale: number;
  widthPx: number;
  heightPx: number;
  offsetX: number;
  offsetY: number;
  alphaAt: (row: number, col: number) => number;
}

interface GridSpan {
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
}

export type { GridSpan, TextureFrame, TextureGrid };
