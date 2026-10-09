/* @layer renderer-widgets @kind hook */
import { useEffect, useRef } from 'react';
import { subscribeTransitionSettled } from '../../../game';
import { liveOverworldScreenOf } from '../nav-flood/live-overworld-screen';
import type { FloodOnTransitionOptions } from './hooks.type';

const useFloodOnTransition = (opts: FloodOnTransitionOptions): void => {
  const { enabled, isIndoors, linkX, linkY, onTrigger } = opts;

  useEffect(() => {
    if (!enabled) return;
    return subscribeTransitionSettled(onTrigger);
  }, [enabled, onTrigger]);

  const prevLiveScreenRef = useRef<number | null>(null);
  useEffect(() => {
    if (!enabled || isIndoors) {
      prevLiveScreenRef.current = null;
      return;
    }
    const liveScreen = liveOverworldScreenOf(linkX, linkY);
    if (prevLiveScreenRef.current !== null && prevLiveScreenRef.current !== liveScreen) {
      onTrigger();
    }
    prevLiveScreenRef.current = liveScreen;
  }, [enabled, isIndoors, linkX, linkY, onTrigger]);
};

export { useFloodOnTransition };
