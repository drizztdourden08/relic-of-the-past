/* @layer renderer-appshell @kind logic */
import type { GameSettings } from '@shared/types/settings';
import type { WindowControlsPort } from '@shared/platform';
import { TITLEBAR_HEIGHT } from '../constants';
import { getGameRatio } from './getGameRatio';

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
  const extra = (wMode === 'default' && !fullscreen) ? TITLEBAR_HEIGHT : 0;
  win.setAspectRatioLock(ratio, extra);
};

export { syncAspectRatioLock };
