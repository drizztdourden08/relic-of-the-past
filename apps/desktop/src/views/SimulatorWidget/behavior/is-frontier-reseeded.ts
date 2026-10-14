/* @layer renderer-widgets @kind logic */
import type { EngineState } from '@rotp/navigation';

const isFrontierReseeded = (previousScreen: string, previousEpoch: number, next: EngineState): boolean => {
  const reseeded = next.virtual.screenId !== previousScreen || next.epoch > previousEpoch;
  const backtrackingOrDone = next.phase === 'traversing' || next.stopHit || next.outcome;
  return reseeded && !backtrackingOrDone;
};

export { isFrontierReseeded };
