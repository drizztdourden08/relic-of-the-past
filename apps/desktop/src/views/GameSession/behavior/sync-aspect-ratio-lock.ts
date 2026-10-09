/* @layer renderer-appshell @kind logic */
import type { GameSettings } from '@rotp/features';
import type { WindowControlsPort } from '@drizztdourden08/brock-core';
import { TITLEBAR_HEIGHT } from '@app/views/GameSession/GameSession.constants';
import { getGameRatio } from './get-game-ratio';

const syncAspectRatioLock = (
  win: WindowControlsPort,
  constraint: GameSettings['viewportConstraint'],
  aspectRatio: GameSettings['aspectRatio'],
  wMode: GameSettings['windowMode'],
  fullscreen: boolean,
): void => {
  if (constraint !== 'fit') {
    win.setAspectRatioLock(0, 0);
    return;
  }
  const ratio = getGameRatio(aspectRatio);
  const extra = (wMode === 'windowed' && !fullscreen) ? TITLEBAR_HEIGHT : 0;
  win.setAspectRatioLock(ratio, extra);
};

export { syncAspectRatioLock };
