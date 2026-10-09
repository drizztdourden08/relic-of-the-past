/* @layer renderer-hud @kind component */
import { useRef } from 'react';
import { useTextureLoop } from './behavior/useTextureLoop';
import type { DialogTextureProps } from './DialogTexture.type';

const DialogTexture = (props: DialogTextureProps) => {
  const { width, height } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useTextureLoop(canvasRef, props);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width, height, display: 'block' }} />;
};

export { DialogTexture };
