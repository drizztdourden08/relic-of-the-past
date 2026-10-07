/* @layer renderer-widgets @kind hook */
/**
 * Memoised access to the observation facade's real-transition enumeration
 * (`@app/lib/game/observations`), which is where the native-table reads and
 * their indoor/outdoor split live. Nothing but the memo is this hook's own.
 */

import { useMemo } from 'react';
import { collectRealTransitions } from '@app/lib/game/observations';
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
