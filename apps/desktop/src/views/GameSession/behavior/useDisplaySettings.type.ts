/* @layer renderer-appshell @kind types */
import type { GameSettings } from '@rotp/features';
import type { WindowControlsPort } from '@drizztdourden08/brock-core';

interface AspectLockState {
  win: WindowControlsPort;
  viewportConstraint: GameSettings['viewportConstraint'];
  aspectRatio: GameSettings['aspectRatio'];
  windowMode: GameSettings['windowMode'];
  isFullscreen: boolean;
}

interface AspectLockParams extends AspectLockState {
  isGameRunning: boolean;
}

interface DisplayInit {
  windowMode: GameSettings['windowMode'];
  viewportConstraint: GameSettings['viewportConstraint'];
  aspectRatio: GameSettings['aspectRatio'];
  displayPerfInTitle: boolean;
  overworldEdgeEffect: boolean;
  postProcessingShadows: boolean;
  startFullscreen: boolean;
  pixelPerfect: boolean;
}

export type { AspectLockParams, AspectLockState, DisplayInit };
