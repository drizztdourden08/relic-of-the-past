/* @layer renderer-appshell @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { parseRatioString, detectScreenRatio, detectViewportRatio } from '@app/lib/game/aspect-ratio';

const getGameRatio = (aspectRatio: GameSettings['aspectRatio']): number => {
  // The live canvas reflects the actual rendered width (including custom ratios), so prefer it.
  const canvas = document.querySelector('.game-layer__canvas') as HTMLCanvasElement | null;
  if (canvas && canvas.width > 0 && canvas.height > 0) {
    return canvas.width / canvas.height;
  }
  // Pre-canvas fallback (only the 'fit' window lock uses this, and it re-syncs once the canvas exists).
  if (aspectRatio === 'auto') {
    const { w, h } = detectViewportRatio();
    return w / h;
  }
  if (aspectRatio === 'screen' || aspectRatio === 'custom') {
    const { w, h } = detectScreenRatio();
    return w / h;
  }
  return parseRatioString(aspectRatio) || 4 / 3;
};

export { getGameRatio };
