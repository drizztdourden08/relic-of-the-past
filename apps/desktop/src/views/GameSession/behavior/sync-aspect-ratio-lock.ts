/* @layer renderer-appshell @kind logic */
import { TITLEBAR_HEIGHT } from '@app/views/GameSession/GameSession.constants';
import { getGameRatio } from './get-game-ratio';
import type { AspectLockState } from './useDisplaySettings.type';

const syncAspectRatioLock = (state: AspectLockState): void => {
  const { win, viewportConstraint, aspectRatio, windowMode, isFullscreen } = state;
  if (viewportConstraint !== 'fit') {
    win.setAspectRatioLock(0, 0);
    return;
  }
  const ratio = getGameRatio(aspectRatio);
  const extra = (windowMode === 'windowed' && !isFullscreen) ? TITLEBAR_HEIGHT : 0;
  win.setAspectRatioLock(ratio, extra);
};

export { syncAspectRatioLock };
