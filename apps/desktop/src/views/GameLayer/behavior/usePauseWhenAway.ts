/* @layer renderer-components @kind hook */
import { useEffect } from 'react';
import { detectHost } from '@drizztdourden08/brock-core';
import { liveSettingsNow } from '@rotp/game-core';
import { getInputManager } from '../../../game';

const pauseIfAway = (): void => {
  if (!document.hidden || !liveSettingsNow()?.pauseWhenAway) return;
  const manager = getInputManager();
  if (!manager.isPaused()) manager.togglePause();
};

const usePauseWhenAway = (status: string): void => {
  useEffect(() => {
    if (status !== 'running' || detectHost() !== 'capacitor') return;
    document.addEventListener('visibilitychange', pauseIfAway);
    return () => document.removeEventListener('visibilitychange', pauseIfAway);
  }, [status]);
};

export { usePauseWhenAway };
