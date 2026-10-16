/* @layer renderer-appshell @kind logic */
import type { GameSettings } from '@rotp/features';
import { parseRatioString, detectScreenRatio, detectViewportRatio } from '@rotp/game-core';
import { ORIGINAL_RATIO } from './useDisplaySettings.constants';

const getGameRatio = (aspectRatio: GameSettings['aspectRatio']): number => {
  const canvas = document.querySelector<HTMLCanvasElement>('.game-layer__canvas');
  if (canvas && canvas.width > 0 && canvas.height > 0) {
    return canvas.width / canvas.height;
  }
  if (aspectRatio === 'auto') {
    const { w, h } = detectViewportRatio();
    return w / h;
  }
  if (aspectRatio === 'screen' || aspectRatio === 'custom') {
    const { w, h } = detectScreenRatio();
    return w / h;
  }
  if (aspectRatio === 'original') return ORIGINAL_RATIO;
  return parseRatioString(aspectRatio) || 4 / 3;
};

export { getGameRatio };
