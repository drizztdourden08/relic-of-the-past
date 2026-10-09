/* @layer renderer-components @kind hook */
import { useEffect } from 'react';
import type { CanvasOverlayLoopConfig, Disposable, OverlayLoopContext } from './useCanvasOverlayLoop.type';

const useCanvasOverlayLoop = <R extends Disposable>(config: CanvasOverlayLoopConfig<R>): void => {
  const { status, canvasKey, gameCanvasRef, fxCanvasRef, rendererRef, setup, createRenderer, onFrame } = config;

  useEffect(() => {
    if (status !== 'running') return;
    const gameCanvas = gameCanvasRef.current;
    const fxCanvas = fxCanvasRef.current;
    if (!gameCanvas || !fxCanvas) return;

    let cancelled = false;
    let rafId = 0;
    let teardown: (() => void) | void;

    const start = async () => {
      teardown = await setup?.({ gameCanvas, fxCanvas });
      if (cancelled) return;

      fxCanvas.width = gameCanvas.width;
      fxCanvas.height = gameCanvas.height;

      const renderer = createRenderer(fxCanvas);
      if (!renderer) return;
      rendererRef.current = renderer;

      const loop = (time: number) => {
        onFrame({ renderer, gameCanvas, fxCanvas, time });
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    };

    const startAfterSdlSizesCanvas = requestAnimationFrame(() => { start(); });

    return () => {
      cancelled = true;
      cancelAnimationFrame(startAfterSdlSizesCanvas);
      cancelAnimationFrame(rafId);
      teardown?.();
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, [status, canvasKey]);
};

export { useCanvasOverlayLoop };
export type { CanvasOverlayLoopConfig, OverlayLoopContext };
