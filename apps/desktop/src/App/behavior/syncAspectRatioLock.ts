import type { GameSettings } from '@shared/types/settings';
import { TITLEBAR_HEIGHT } from '../constants';
import { getGameRatio } from './getGameRatio';

export const syncAspectRatioLock = (
  constraint: GameSettings['viewportConstraint'],
  aspectRatio: GameSettings['aspectRatio'],
  wMode: GameSettings['windowMode'],
  fullscreen: boolean,
): void => {
  if (constraint !== 'fit') {
    window.api.setAspectRatioLock(0, 0);
    return;
  }
  const ratio = getGameRatio(aspectRatio);
  const extra = (wMode === 'default' && !fullscreen) ? TITLEBAR_HEIGHT : 0;
  window.api.setAspectRatioLock(ratio, extra);
};
