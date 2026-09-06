/* @layer tests @kind test */
/**
 * The recommendation store's main-process half, against a throwaway userData
 * root (the same bargain `review-files.test.ts` makes).
 *
 * The property that matters is the per-kind queue. Every operation is a
 * read-modify-write of a whole collection file, and the queue must wrap the
 * WHOLE operation, not just the write: queueing only the save would still let
 * two decisions read the same snapshot. A batch accept depends on this.
 */
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createRecommendationStore } from '@shared/game/recommendations';
import { initPaths } from '../../apps/desktop/electron/lib/paths';
import {
  loadRecommendationFile, queued, recommendationFilePath, recommendationStorage,
} from '../../apps/desktop/electron/recommendations/recommendation-files';
import type { Recommendation } from '@shared/game/recommendations';

let root = '';

const entry = (id: string, over: Partial<Recommendation> = {}): Recommendation => ({
  id,
  kind: 'tag',
  action: 'update',
  targetId: 'tag-001',
  current: null,
  proposed: { id: 'tag-001' },
  reason: 'the dataset disagrees',
  detector: 'test',
  evidence: [],
  confidence: 'certain',
  screenId: null,
  origin: 'live',
  state: 'open',
  firstSeenAt: 1,
  decidedAt: null,
  ...over,
} as Recommendation);

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'rotp-recommendations-'));
  initPaths(root);
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('where a collection lives', () => {
  it('files each kind under the engine\'s own relative path', () => {
    expect(recommendationFilePath('tag')).toBe(join(root, 'Data', 'recommendations', 'tag.json'));
  });

  it('reads a missing file as empty instead of throwing', async () => {
    expect(await loadRecommendationFile('tag')).toEqual([]);
  });
});

describe('the store, on disk', () => {
  it('round-trips what a verdict wrote', async () => {
    await recommendationStorage.save('tag', [entry('r-1')]);
    const store = createRecommendationStore(recommendationStorage);

    const after = await store.decide('tag', 'r-1', 'accepted', 5000);
    expect(after[0].state).toBe('accepted');
    expect((await loadRecommendationFile('tag'))[0].decidedAt).toBe(5000);
  });

  it('keeps each collection in its own file', async () => {
    await recommendationStorage.save('tag', [entry('r-1')]);
    expect(await loadRecommendationFile('item')).toEqual([]);
  });
});

describe('two decisions on one collection', () => {
  // Both read-modify-write the same file. Unqueued, the second one's read
  // predates the first one's write and the first verdict is lost.
  it('both land when each holds the kind\'s turn for its whole operation', async () => {
    await recommendationStorage.save('tag', [entry('r-1'), entry('r-2')]);
    const store = createRecommendationStore(recommendationStorage);

    await Promise.all([
      queued('tag', () => store.decide('tag', 'r-1', 'accepted', 1)),
      queued('tag', () => store.decide('tag', 'r-2', 'dismissed', 2)),
    ]);

    const file = await loadRecommendationFile('tag');
    expect(file.map(item => item.state)).toEqual(['accepted', 'dismissed']);
  });

  // The contrast: the same two operations without the queue cannot keep both.
  // Either the later write overwrites the earlier verdict, or the two writes
  // collide on the file itself and it reads back as nothing.
  it('would lose a verdict without the queue', async () => {
    await recommendationStorage.save('tag', [entry('r-1'), entry('r-2')]);
    const store = createRecommendationStore(recommendationStorage);

    await Promise.all([
      store.decide('tag', 'r-1', 'accepted', 1),
      store.decide('tag', 'r-2', 'dismissed', 2),
    ]);

    const file = await loadRecommendationFile('tag');
    expect(file.filter(item => item.state !== 'open').length).toBeLessThan(2);
  });

  it('lets a failed operation go without stalling the ones behind it', async () => {
    await recommendationStorage.save('tag', [entry('r-1')]);
    const store = createRecommendationStore(recommendationStorage);

    const boom = queued('tag', () => Promise.reject(new Error('disk error')));
    const after = queued('tag', () => store.decide('tag', 'r-1', 'accepted', 3));

    await expect(boom).rejects.toThrow('disk error');
    expect((await after)[0].state).toBe('accepted');
  });

  it('does not serialize across collections', async () => {
    const order: string[] = [];
    const slow = queued('tag', async () => {
      await new Promise((resolve) => { setTimeout(resolve, 10); });
      order.push('tag');
    });
    const quick = queued('item', () => { order.push('item'); return Promise.resolve(); });

    await Promise.all([slow, quick]);
    expect(order).toEqual(['item', 'tag']);
  });
});
