/* @layer renderer-appshell @kind hook */
import { useEffect, useRef } from 'react';
import { getGameState, subscribeGameState } from '@rotp/game-core';
import { syncAspectRatioLock } from './sync-aspect-ratio-lock';
import type { AspectLockParams } from './useDisplaySettings.type';

const useAspectRatioLock = (params: AspectLockParams) => {
  const { win, isGameRunning, viewportConstraint, aspectRatio, windowMode, isFullscreen } = params;

  useEffect(() => {
    if (!isGameRunning) return;
    if (viewportConstraint === 'fit' && getGameState().status !== 'running') return;
    syncAspectRatioLock({ win, viewportConstraint, aspectRatio, windowMode, isFullscreen });
  }, [win, isGameRunning, viewportConstraint, aspectRatio, windowMode, isFullscreen]);

  const latest = useRef({ win, viewportConstraint, aspectRatio, windowMode, isFullscreen });
  latest.current = { win, viewportConstraint, aspectRatio, windowMode, isFullscreen };

  useEffect(() => {
    if (!isGameRunning) {
      if (latest.current.viewportConstraint === 'fit') {
        win.setAspectRatioLock(0, 0);
      }
      return;
    }
    if (latest.current.viewportConstraint !== 'fit') return;
    return subscribeGameState((state) => {
      if (state.status === 'running') syncAspectRatioLock(latest.current);
    });
  }, [win, isGameRunning]);
};

export { useAspectRatioLock };
