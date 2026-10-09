/* @layer bridge-wasm @kind logic */
import type { ObservedTransition } from '@rotp/game-core';
import { collectCrossings } from '../crossings';
import { usableCrossings } from '../usable-crossings';
import { transitionsFromCrossings } from '@rotp/game-core';
import type { TransitionScope } from '@rotp/game-core';

const collectRealTransitions = (scope: TransitionScope): ObservedTransition[] => {
  const { isIndoors, roomIndex, overworldScreenIndex, floodConnections } = scope;
  const collected = collectCrossings({
    isIndoors, roomIndex, owScreenIndex: overworldScreenIndex, connections: floodConnections,
  });
  const usable = usableCrossings(collected, { isIndoors, roomIndex, connections: floodConnections });
  return transitionsFromCrossings(usable, isIndoors);
};

export { collectRealTransitions };
