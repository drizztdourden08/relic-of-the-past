/* @layer renderer-app @kind logic */
import { appApi } from '@app/ipc/app-api';
import type { EntityKind } from '@rotp/game-data';
import { storeRecommendations } from './store-recommendations';

const decideRecommendation = async (
  kind: EntityKind,
  id: string,
  state: 'accepted' | 'dismissed',
): Promise<void> => {
  storeRecommendations(kind, await appApi().decideRecommendation(kind, id, state));
};

export { decideRecommendation };
