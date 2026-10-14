/* @layer renderer-appshell @kind hook */
import { useEffect, useRef } from 'react';
import { syncAspectRatioLock } from './sync-aspect-ratio-lock';
import { CANVAS_POLL_ATTEMPTS, CANVAS_POLL_MS } from './useDisplaySettings.constants';
import type { AspectLockParams } from './useDisplaySettings.type';

const useAspectRatioLock = (params: AspectLockParams) => {
  const { win, isGameRunning, viewportConstraint, aspectRatio, windowMode, isFullscreen } = params;

  useEffect(() => {
    if (!isGameRunning) return;
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
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      const canvas = document.querySelector<HTMLCanvasElement>('.game-layer__canvas');
      if ((canvas && canvas.width > 0 && canvas.height > 0) || attempts >= CANVAS_POLL_ATTEMPTS) {
        clearInterval(poll);
        syncAspectRatioLock(latest.current);
      }
    }, CANVAS_POLL_MS);
    return () => clearInterval(poll);
  }, [win, isGameRunning]);
};

export { useAspectRatioLock };
