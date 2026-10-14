/* @layer renderer-components @kind component */
import { useRef } from 'react';
import { Canvas } from '@drizztdourden08/tessera/primitives';
import { useOverlayDrawLoop } from '../behavior/useOverlayDrawLoop';
import type { OverlayCanvasProps } from './OverlayCanvas.type';

const OverlayCanvas = ({ width, height, gameRunning, mouseStateRef }: OverlayCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useOverlayDrawLoop({ canvasRef, width, height, gameRunning, mouseStateRef });

  return (
    <Canvas
      ref={canvasRef}
      className="nav-overlay__canvas"
      width={width}
      height={height}
    />
  );
};

export { OverlayCanvas };
