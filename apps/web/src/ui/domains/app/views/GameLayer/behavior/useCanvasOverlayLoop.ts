/* @layer renderer-components @kind hook */
/**
 * Shared rAF lifecycle for a fullscreen WebGL overlay driven off the game canvas
 * (edge-glow, shadow-casting). Encapsulates the guard → size-fx-canvas → create
 * renderer → requestAnimationFrame loop → dispose scaffold so each feature
 * supplies only its async setup, per-frame body, and optional teardown.
 */
import { useEffect } from 'react';
import type React from 'react';

interface Disposable {
  dispose: () => void;
}

interface OverlayLoopContext {
  gameCanvas: HTMLCanvasElement;
  fxCanvas: HTMLCanvasElement;
}

interface CanvasOverlayLoopConfig<R extends Disposable> {
  status: string;
  /** Bump to force a full teardown + re-init (e.g. on canvas remount). */
  canvasKey: number;
  gameCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  fxCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  rendererRef: React.MutableRefObject<R | null>;
  /** Optional async work before renderer creation; may return a teardown fn. */
  setup?: (ctx: OverlayLoopContext) => Promise<(() => void) | void> | (() => void) | void;
  /** Build the renderer for the fx canvas; return null to abort the loop. */
  createRenderer: (fxCanvas: HTMLCanvasElement) => R | null;
  /** Per-frame body. Owns its own buffer-size sync against the game canvas. */
  onFrame: (ctx: OverlayLoopContext & { renderer: R; time: number }) => void;
}

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

      // Match FX canvas buffer to game canvas buffer.
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

    // Wait a frame for SDL to set canvas dimensions, then init.
    const initId = requestAnimationFrame(() => { start(); });

    return () => {
      cancelled = true;
      cancelAnimationFrame(initId);
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
