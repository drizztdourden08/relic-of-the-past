/* @layer renderer-widgets @kind hook */
import { useEffect, useSyncExternalStore } from 'react';
import {
  clearMusicDebug, getMusicDebugCounters, getMusicDebugEvents,
  setMusicDebugArmed, subscribeMusicDebug,
} from '@app/lib/game/music-debug';

const useMusicDebugData = () => {
  useEffect(() => {
    setMusicDebugArmed(true);
    return () => { setMusicDebugArmed(false); };
  }, []);

  const events = useSyncExternalStore(subscribeMusicDebug, getMusicDebugEvents);
  const counters = useSyncExternalStore(subscribeMusicDebug, getMusicDebugCounters);

  return { events, counters, clear: clearMusicDebug };
};

export { useMusicDebugData };
