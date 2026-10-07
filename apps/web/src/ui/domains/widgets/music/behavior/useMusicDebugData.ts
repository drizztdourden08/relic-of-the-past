/* @layer renderer-widgets @kind hook */
/**
 * The widget's window onto the music-debug feed: arms the core-side traces while mounted, and
 * reads the event list and the counters through useSyncExternalStore so a burst of events is one
 * render, not one per event.
 */
import { useEffect, useSyncExternalStore } from 'react';
import {
  clearMusicDebug, getMusicDebugCounters, getMusicDebugEvents,
  setMusicDebugArmed, subscribeMusicDebug,
} from '@app/lib/game/music-debug';

const useMusicDebugData = () => {
  // Armed exactly while a debugger is watching: the trace costs a host-call per sound.
  useEffect(() => {
    setMusicDebugArmed(true);
    return () => { setMusicDebugArmed(false); };
  }, []);

  const events = useSyncExternalStore(subscribeMusicDebug, getMusicDebugEvents);
  const counters = useSyncExternalStore(subscribeMusicDebug, getMusicDebugCounters);

  return { events, counters, clear: clearMusicDebug };
};

export { useMusicDebugData };
