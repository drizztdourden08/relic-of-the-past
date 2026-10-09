/* @layer renderer-widgets @kind logic */
import type { ScreenId } from '@rotp/game-data';
import { unread } from '@shared/game/recommendations/compare';
import type { Probe } from '@shared/game/recommendations/compare';
import type { ObservedTransition, ScreenObservations } from '@shared/game/recommendations';
import { storedOnFarSide, transitionKey } from '../screen-endpoint';
import { readIndoorEdgeDataset } from './read-indoor-edge-dataset';

const readIndoorEdgeLive = (observations: ScreenObservations, screenId: ScreenId | null): Probe<readonly ObservedTransition[]> => {
  if (!observations.isIndoors || !observations.walkBoundaries || !observations.doorBoundaries) return unread();
  const here = readIndoorEdgeDataset(observations, screenId);
  const seen = new Set<number>();
  const crossings: ObservedTransition[] = [];
  for (const boundary of observations.walkBoundaries) {
    if (boundary.destRoom === 0 || seen.has(boundary.destRoom)) continue;
    seen.add(boundary.destRoom);
    const crossing: ObservedTransition = { source: 'walk-boundary', kind: 'room', index: boundary.destRoom };
    if (storedOnFarSide(screenId, transitionKey(crossing), observations.existingConnections, here)) continue;
    crossings.push(crossing);
  }
  return { known: true, value: crossings };
};

export { readIndoorEdgeLive };
