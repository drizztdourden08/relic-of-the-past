/* @layer bridge-wasm @kind logic */
import type { ConnectionInfo } from '@shared/game/navigation';
import type { ObservedTransition } from '@shared/game/recommendations';
import { collectCrossings } from '../crossings';
import { usableCrossings } from '../usable-crossings';
import { transitionsFromCrossings } from './crossing-transitions';

interface RealTransitionScope {
  isIndoors: boolean;
  roomIndex: number;
  overworldScreenIndex: number;
  floodConnections: readonly ConnectionInfo[];
}

/**
 * Every REAL in-game transition leaving the current screen, taken from the
 * crossings facade so one producer answers the navigation widget, the simulator
 * and the recommendations alike. `usableCrossings` applies the span and
 * plausibility filters on the way through, so a border bundle the simulator
 * refuses is not offered here either.
 */
const collectRealTransitions = (scope: RealTransitionScope): ObservedTransition[] => {
  const { isIndoors, roomIndex, overworldScreenIndex, floodConnections } = scope;
  const collected = collectCrossings({
    isIndoors, roomIndex, owScreenIndex: overworldScreenIndex, connections: floodConnections,
  });
  const usable = usableCrossings(collected, { isIndoors, roomIndex, connections: floodConnections });
  return transitionsFromCrossings(usable, isIndoors);
};

export { collectRealTransitions };
