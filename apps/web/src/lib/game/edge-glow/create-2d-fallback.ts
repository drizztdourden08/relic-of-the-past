/* @layer bridge-wasm @kind logic */
/**
 * 2D passthrough fallback for the Edge Glow renderer.
 *
 * Used when WebGL is unavailable: it just copies the game canvas into the fx
 * canvas each frame and no-ops every effect control, so the game still renders.
 */

import type { EdgeGlowRenderer } from './types';

const create2DFallbackRenderer = (fxCanvas: HTMLCanvasElement): EdgeGlowRenderer | null => {
  const ctx = fxCanvas.getContext('2d');
  if (!ctx) return null;
  const render = (gameCanvas: HTMLCanvasElement): void => {
    if (fxCanvas.width !== gameCanvas.width || fxCanvas.height !== gameCanvas.height) {
      fxCanvas.width = gameCanvas.width;
      fxCanvas.height = gameCanvas.height;
    }
    ctx.drawImage(gameCanvas, 0, 0);
  };
  const noop = (): void => {};
  return { render, resize: noop, setEnabled: noop, setBlackBounds: noop, setMaxBounds: noop, setEffectOpacity: noop, setPixelateParams: noop, dispose: noop };
};

export { create2DFallbackRenderer };
