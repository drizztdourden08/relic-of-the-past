/* @layer renderer-components @kind types */
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
  canvasKey: number;
  gameCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  fxCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  rendererRef: React.RefObject<R | null>;
  setup?: (ctx: OverlayLoopContext) => Promise<(() => void) | void> | (() => void) | void;
  createRenderer: (fxCanvas: HTMLCanvasElement) => R | null;
  onFrame: (ctx: OverlayLoopContext & { renderer: R; time: number }) => void;
}

export type { CanvasOverlayLoopConfig, Disposable, OverlayLoopContext };
