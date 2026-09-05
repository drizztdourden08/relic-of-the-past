/* @layer electron-main @kind logic */
/**
 * IPC handlers for the recommendation store.
 *
 * The store itself lives here, not in the renderer, because both of its
 * mutating operations are read-modify-write over a whole collection file, and
 * splitting them across an IPC round trip would put the read and the write on
 * opposite sides of a boundary two callers can interleave on. Keeping the
 * collection on this side means one queue (see `recommendation-files.ts`) makes
 * every caller's operations sequential, which is what a batch accept relies on.
 */
import { createRecommendationStore } from '@shared/game/recommendations';
import { handle } from '../lib/ipc/handle';
import { loadRecommendationFile, queued, recommendationStorage } from './recommendation-files';

const store = createRecommendationStore(recommendationStorage);

const registerRecommendationHandlers = (): void => {
  handle('recommendations:load', (_e, kind) => loadRecommendationFile(kind));

  handle('recommendations:applyPass', (_e, kind, context, detectorIds, drafts) =>
    queued(kind, () => store.applyPass(kind, context, detectorIds, drafts)));

  handle('recommendations:decide', (_e, kind, id, state) =>
    queued(kind, () => store.decide(kind, id, state)));
};

export { registerRecommendationHandlers };
