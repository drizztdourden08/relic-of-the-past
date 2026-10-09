/* @layer renderer-app @kind logic */
import type { EntityKind } from '@shared/game/data';
import { storeRecommendations } from './store-recommendations';

const decideRecommendation = async (
  kind: EntityKind,
  id: string,
  state: 'accepted' | 'dismissed',
): Promise<void> => {
  storeRecommendations(kind, await window.api.decideRecommendation(kind, id, state));
};

export { decideRecommendation };
