/* @layer tests @kind test */
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createRecommendationStore } from '@rotp/navigation';
import { initPaths } from '@drizztdourden08/brock-electron/node';
import {
  loadRecommendationFile, queued, recommendationStorage,
} from '../../electron/recommendations/recommendation-files';
import type { Recommendation } from '@rotp/navigation';
import { required } from '@rotp/asset-extraction/testing';

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

describe('where a collection lives', { tags: ['critical'] }, () => {
  it('reads a missing file as empty instead of throwing', async () => {
    expect(await loadRecommendationFile('tag')).toEqual([]);
  });
});

describe('the store, on disk', { tags: ['critical'] }, () => {
  it('round-trips what a verdict wrote', async () => {
    await recommendationStorage.save('tag', [entry('r-1')]);
    const store = createRecommendationStore(recommendationStorage);

    const after = await store.decide('tag', 'r-1', 'accepted', 5000);
    expect(required(after[0], 'the decided entry').state).toBe('accepted');
    expect(required((await loadRecommendationFile('tag'))[0], 'the stored entry').decidedAt).toBe(5000);
  });

  it('keeps each collection in its own file', async () => {
    await recommendationStorage.save('tag', [entry('r-1')]);
    expect(await loadRecommendationFile('item')).toEqual([]);
  });
});

describe('two decisions on one collection', { tags: ['critical'] }, () => {
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

  it('lets a failed operation go without stalling the ones behind it', async () => {
    await recommendationStorage.save('tag', [entry('r-1')]);
    const store = createRecommendationStore(recommendationStorage);

    const boom = queued('tag', () => Promise.reject(new Error('disk error')));
    const after = queued('tag', () => store.decide('tag', 'r-1', 'accepted', 3));

    await expect(boom).rejects.toThrow('disk error');
    expect(required((await after)[0], 'the decided entry').state).toBe('accepted');
  });

  it('does not serialize across collections', async () => {
    const order: string[] = [];
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const slow = queued('tag', async () => {
      await gate;
      order.push('tag');
    });
    const quick = queued('item', () => { order.push('item'); return Promise.resolve(); });

    await quick;
    release();
    await slow;
    expect(order).toEqual(['item', 'tag']);
  });
});
