/* @layer renderer-appshell @kind logic */
import type { GameSettings } from '@rotp/features';
import { parseRatioString, detectScreenRatio, detectViewportRatio } from '@rotp/game-core';

const getGameRatio = (aspectRatio: GameSettings['aspectRatio']): number => {
  const canvas = document.querySelector('.game-layer__canvas');
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
  return parseRatioString(aspectRatio) || 4 / 3;
};

export { getGameRatio };
