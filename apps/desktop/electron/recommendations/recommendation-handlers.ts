/* @layer electron-main @kind logic */
import { createRecommendationStore } from '@rotp/navigation';
import { handle } from '@drizztdourden08/brock-electron/main';
import { loadRecommendationFile, queued, recommendationStorage } from './recommendation-files';

const store = createRecommendationStore(recommendationStorage);

const registerRecommendationHandlers = (): void => {
  handle('recommendations:load', async (_e, kind) => loadRecommendationFile(kind));

  handle('recommendations:applyPass', async (_e, ...[kind, context, detectorIds, drafts]) =>
    queued(kind, () => store.applyPass(kind, context, { detectorIds, fresh: drafts })));

  handle('recommendations:decide', async (_e, kind, id, state) =>
    queued(kind, () => store.decide(kind, id, state)));
};

export { registerRecommendationHandlers };
