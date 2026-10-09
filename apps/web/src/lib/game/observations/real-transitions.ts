/* @layer bridge-wasm @kind logic */
import type { ObservedTransition } from '@shared/game/recommendations';
import { collectCrossings } from '../crossings';
import { usableCrossings } from '../usable-crossings';
import { transitionsFromCrossings } from './crossing-transitions';
import type { TransitionScope } from './real-transitions.type';

const collectRealTransitions = (scope: TransitionScope): ObservedTransition[] => {
  const { isIndoors, roomIndex, overworldScreenIndex, floodConnections } = scope;
  const collected = collectCrossings({
    isIndoors, roomIndex, owScreenIndex: overworldScreenIndex, connections: floodConnections,
  });
  const usable = usableCrossings(collected, { isIndoors, roomIndex, connections: floodConnections });
  return transitionsFromCrossings(usable, isIndoors);
};

export { collectRealTransitions };
