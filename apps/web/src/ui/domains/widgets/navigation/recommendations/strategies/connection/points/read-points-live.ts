/* @layer renderer-widgets @kind logic */
import type { ScreenId } from '@shared/game/data';
import { unread } from '@shared/game/recommendations/compare';
import type { Probe } from '@shared/game/recommendations/compare';
import type { ObservedTransition, ScreenObservations } from '@shared/game/recommendations';
import { storedOnFarSide, transitionKey } from '../screen-endpoint';
import { ENUMERABLE_SOURCES } from '../connection.constants';
import { readPointsDataset } from './read-points-dataset';

const readPointsLive = (observations: ScreenObservations, screenId: ScreenId | null): Probe<readonly ObservedTransition[]> => {
  if (!observations.realAvailable) return unread();
  const here = readPointsDataset(observations, screenId);
  const seen = new Set<string>();
  const enumerable: ObservedTransition[] = [];
  for (const t of observations.realTransitions) {
    if (!ENUMERABLE_SOURCES.has(t.source)) continue;
    const key = transitionKey(t);
    if (seen.has(key)) continue;
    seen.add(key);
    if (storedOnFarSide(screenId, key, observations.existingConnections, here)) continue;
    enumerable.push(t);
  }
  return { known: true, value: enumerable };
};

export { readPointsLive };
