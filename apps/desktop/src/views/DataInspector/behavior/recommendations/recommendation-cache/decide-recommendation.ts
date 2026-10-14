/* @layer renderer-app @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import type { EntityKind } from '@rotp/game-data';
import { storeRecommendations } from './store-recommendations';

const decideRecommendation = async (
  kind: EntityKind,
  id: string,
  state: 'accepted' | 'dismissed',
): Promise<void> => {
  storeRecommendations(kind, await requireHostApi().decideRecommendation(kind, id, state));
};

export { decideRecommendation };
