/* @layer renderer-app @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import type { RecommendationPassRequest } from '@app/ipc';
import { storeRecommendations } from './store-recommendations';

const applyRecommendationPass = async (pass: RecommendationPassRequest): Promise<void> => {
  const result = await requireHostApi().applyRecommendationPass(pass);
  storeRecommendations(pass.kind, result.entries);
};

export { applyRecommendationPass };
