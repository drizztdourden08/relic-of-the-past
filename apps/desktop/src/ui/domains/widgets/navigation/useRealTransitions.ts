/* @layer renderer-widgets @kind hook */
import { useMemo } from 'react';
import { collectRealTransitions } from '@app/lib/game/observations/real-transitions';
import type { ConnectionInfo } from '@shared/game/navigation';
import type { ObservedTransition } from '@shared/game/recommendations';

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
