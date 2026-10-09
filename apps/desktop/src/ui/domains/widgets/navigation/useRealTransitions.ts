/* @layer renderer-widgets @kind hook */
import { useMemo } from 'react';
import { collectRealTransitions } from '@rotp/navigation';
import type { ConnectionInfo } from '@rotp/game-core';
import type { ObservedTransition } from '@rotp/game-core';

const useRealTransitions = (
  isIndoors: boolean,
  roomIndex: number,
  floodConnections: ConnectionInfo[],
  overworldScreenIndex: number,
): readonly ObservedTransition[] => {
  return useMemo(
    () => collectRealTransitions({ isIndoors, roomIndex, floodConnections, overworldScreenIndex }),
    [isIndoors, roomIndex, floodConnections, overworldScreenIndex],
  );
};

export { useRealTransitions };
