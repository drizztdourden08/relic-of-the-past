/* @layer tests @kind test */
/**
 * The review layer's main-process read/write, run against a throwaway
 * userData root rather than the real app data directory — the same bargain
 * `enumeration-writer.test.ts` makes for the screen-editor writers. Covers
 * the three things the plan calls out: a missing file reads as empty, a
 * saved entry round-trips, and one id's write never clobbers another's in
 * the same kind's file — including under concurrent same-kind saves, which is
 * exactly what the per-kind write queue in `review-files.ts` exists to guard.
 */
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initPaths } from '../../apps/desktop/electron/lib/paths';
import { loadReviewFile, saveReviewEntry } from '../../apps/desktop/electron/review/review-files';
import type { ReviewEntry } from '../../shared/game/review/types';

let root = '';

const entry = (overrides: Partial<ReviewEntry> = {}): ReviewEntry => ({
  status: 'untouched', note: '', reviewedAt: null, updatedAt: null, ...overrides,
});

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'rotp-review-'));
  initPaths(root);
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('loadReviewFile', () => {
  it('reads a missing file as empty rather than throwing', async () => {
    expect(await loadReviewFile('screen')).toEqual({});
  });
});

describe('saveReviewEntry', () => {
  it('round-trips a saved entry', async () => {
    const saved = entry({ status: 'in-review', note: 'looks off', reviewedAt: 1000 });
    await saveReviewEntry('screen', 'screen-001', saved);
    expect(await loadReviewFile('screen')).toEqual({ 'screen-001': saved });
  });

  it('does not clobber another id already in the same kind file', async () => {
    await saveReviewEntry('screen', 'screen-001', entry({ status: 'accepted', reviewedAt: 1 }));
    await saveReviewEntry('screen', 'screen-002', entry({ status: 'needs-work', reviewedAt: 2 }));
    const file = await loadReviewFile('screen');
    expect(file['screen-001'].status).toBe('accepted');
    expect(file['screen-002'].status).toBe('needs-work');
  });

  it('keeps each kind in its own file', async () => {
    await saveReviewEntry('screen', 'screen-001', entry({ status: 'verified', reviewedAt: 1 }));
    expect(await loadReviewFile('connection')).toEqual({});
  });

  it('overwrites a prior entry for the same id', async () => {
    await saveReviewEntry('screen', 'screen-001', entry({ status: 'in-review', reviewedAt: 1 }));
    await saveReviewEntry('screen', 'screen-001', entry({ status: 'verified', reviewedAt: 2 }));
    expect(await loadReviewFile('screen')).toEqual({ 'screen-001': entry({ status: 'verified', reviewedAt: 2 }) });
  });

  it('serializes concurrent saves to the same kind instead of losing one', async () => {
    await Promise.all([
      saveReviewEntry('screen', 'a', entry({ reviewedAt: 1 })),
      saveReviewEntry('screen', 'b', entry({ reviewedAt: 2 })),
      saveReviewEntry('screen', 'c', entry({ reviewedAt: 3 })),
    ]);
    const file = await loadReviewFile('screen');
    expect(Object.keys(file).sort()).toEqual(['a', 'b', 'c']);
  });
});
