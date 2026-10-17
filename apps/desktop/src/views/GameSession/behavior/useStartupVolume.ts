/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { hostApi, useVolumeStore } from '@drizztdourden08/brock-react';
import { subscribeGameState } from '@app/game';

const useStartupVolume = (): void => {
  useEffect(() => {
    const startup = hostApi()?.startup;
    if (!startup?.muted && !startup?.sound) return;
    const unsubscribe = subscribeGameState((state) => {
      if (state.status !== 'running') return;
      unsubscribe();
      const { value, muted, setMuted, toggleMute } = useVolumeStore.getState();
      const silent = muted || value <= 0;
      if (startup.muted === true && !silent) setMuted(true);
      if (startup.muted !== true && silent) toggleMute();
    });
    return unsubscribe;
  }, []);
};

export { useStartupVolume };
