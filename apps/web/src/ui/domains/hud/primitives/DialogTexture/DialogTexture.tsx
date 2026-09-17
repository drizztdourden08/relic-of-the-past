/* @layer renderer-hud @kind component */
/**
 * The repeating texture on a message box ground, painted into a canvas and repainted each frame
 * while it animates. The canvas fills its parent, which carries the ground's own corner shape, so
 * the pattern is clipped exactly like the fill under it.
 */
import { useRef } from 'react';
import type { DialogTexture as DialogTextureKind, DialogTextureAnimation, DialogTextureSpeed } from '@shared/game/dialog/box-style';
import { useTextureLoop } from './behavior/useTextureLoop';

interface DialogTextureProps {
  /** CSS pixels. */
  width: number;
  height: number;
  /** CSS pixels per game pixel. */
  unit: number;
  texture: DialogTextureKind;
  color: string;
  opacity: number;
  animation: DialogTextureAnimation;
  speed: DialogTextureSpeed;
  /** Cell size multiplier. */
  scale: number;
  /** 0..100, how close the cells sit. */
  density: number;
  /** 0..100, how far cells stray from the grid. */
  scatter: number;
}

const DialogTexture = (props: DialogTextureProps) => {
  const { width, height } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useTextureLoop(canvasRef, props);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width, height, display: 'block' }} />;
};

export { DialogTexture };
export type { DialogTextureProps };
