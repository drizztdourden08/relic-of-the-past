/* @layer electron-main @kind logic */
/**
 * IPC handlers for the recommendation store.
 *
 * The store itself lives here rather than in the renderer because both of its
 * mutating operations are read-modify-write over a whole collection file, and
 * splitting them across an IPC round trip would put the read and the write on
 * opposite sides of a boundary two callers can interleave on. Keeping the
 * collection on this side means one queue (see `recommendation-files.ts`) makes
 * every caller's operations sequential, which is what a batch accept relies on.
 *
 * Every handler waits on one repair pass first (`migrateMisfiledEntries`): an
 * entry filed under a collection it is not about can never be decided, and once
 * a later pass files the same id correctly the finding exists twice. The repair
 * runs before any handler touches a file, and outside the per-kind queues on
 * purpose — it spans several collections at once, so taking one kind's turn
 * would not protect the others. That is safe only because nothing else can be
 * in flight yet: the promise is created at registration, and each handler awaits
 * it before doing anything of its own.
 */
import { createRecommendationStore, migrateMisfiledEntries } from '@shared/game/recommendations';
import { handle } from '../lib/ipc/handle';
import {
  loadRecommendationFile, queued, recommendationStorage, storedRecommendationKinds,
} from './recommendation-files';

const store = createRecommendationStore(recommendationStorage);

const repairStoredFiles = async (): Promise<void> => {
  await migrateMisfiledEntries(recommendationStorage, await storedRecommendationKinds());
};

const registerRecommendationHandlers = (): void => {
  const repaired = repairStoredFiles().catch(() => {});

  handle('recommendations:load', async (_e, kind) => {
    await repaired;
    return loadRecommendationFile(kind);
  });

  handle('recommendations:applyPass', async (_e, kind, context, detectorIds, drafts) => {
    await repaired;
    return queued(kind, () => store.applyPass(kind, context, detectorIds, drafts));
  });

  handle('recommendations:decide', async (_e, kind, id, state) => {
    await repaired;
    return queued(kind, () => store.decide(kind, id, state));
  });
};

export { registerRecommendationHandlers };
