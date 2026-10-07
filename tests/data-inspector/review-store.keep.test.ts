/* @layer tests @kind test */
/**
 * The review store's cache/debounce discipline, in the style of
 * `tests/storage/ui-views.test.ts`: stub `window.api`, fake timers, fresh
 * dynamic import per test (the module keeps cache/timers as top-level state).
 */
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import type { EntityKind } from '../../shared/game/data';
import type { ReviewEntry } from '../../shared/game/review/types';
import type * as ReviewStoreModule from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/review-store';

let loadReview: ReturnType<typeof vi.fn>;
let saveReview: ReturnType<typeof vi.fn>;
let reviewStore: typeof ReviewStoreModule;

const DEFAULT: ReviewEntry = { status: 'untouched', note: '', reviewedAt: null, updatedAt: null };

beforeEach(async () => {
  vi.resetModules();
  loadReview = vi.fn().mockResolvedValue({});
  saveReview = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('window', { api: { loadReview, saveReview } });
  vi.useFakeTimers();
  reviewStore = await import('../../apps/web/src/ui/domains/app/views/DataInspector/behavior/review-store');
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('reviewFor and its default entry', () => {
  it('answers the untouched default for an id with no saved entry', () => {
    expect(reviewStore.reviewFor('screen' as EntityKind, 'screen-001')).toEqual(DEFAULT);
  });

  it('kicks off a background load for a kind the first time it is asked for', () => {
    reviewStore.reviewFor('screen' as EntityKind, 'screen-001');
    expect(loadReview).toHaveBeenCalledWith('screen');
    expect(loadReview).toHaveBeenCalledTimes(1);
  });

  it('does not re-load a kind already loading or loaded', async () => {
    reviewStore.reviewFor('screen' as EntityKind, 'screen-001');
    reviewStore.reviewFor('screen' as EntityKind, 'screen-002');
    await vi.runAllTimersAsync();
    reviewStore.reviewFor('screen' as EntityKind, 'screen-001');
    expect(loadReview).toHaveBeenCalledTimes(1);
  });

  it('reflects a saved entry once the load resolves', async () => {
    loadReview.mockResolvedValue({ 'screen-001': { status: 'verified', note: 'looks good', reviewedAt: 5, updatedAt: null } });
    reviewStore.reviewFor('screen' as EntityKind, 'screen-001');
    await vi.runAllTimersAsync();
    expect(reviewStore.reviewFor('screen' as EntityKind, 'screen-001')).toEqual({
      status: 'verified', note: 'looks good', reviewedAt: 5, updatedAt: null,
    });
  });

  it('falls back to the empty file when the load rejects', async () => {
    loadReview.mockRejectedValue(new Error('disk error'));
    reviewStore.reviewFor('screen' as EntityKind, 'screen-001');
    await vi.runAllTimersAsync();
    expect(reviewStore.reviewFor('screen' as EntityKind, 'screen-001')).toEqual(DEFAULT);
  });
});

describe('setReviewStatus / setReviewNote', () => {
  it('updates the cached entry immediately and stamps reviewedAt', () => {
    const before = Date.now();
    reviewStore.setReviewStatus('screen' as EntityKind, 'screen-001', 'in-review');
    const entry = reviewStore.reviewFor('screen' as EntityKind, 'screen-001');
    expect(entry.status).toBe('in-review');
    expect(entry.reviewedAt).toBeGreaterThanOrEqual(before);
  });

  it('debounces the IPC save instead of writing on every keystroke', () => {
    reviewStore.setReviewNote('screen' as EntityKind, 'screen-001', 'first');
    reviewStore.setReviewNote('screen' as EntityKind, 'screen-001', 'first draft');
    expect(saveReview).not.toHaveBeenCalled();
  });

  it('sends the merged entry to window.api.saveReview after the debounce', async () => {
    reviewStore.setReviewNote('screen' as EntityKind, 'screen-001', 'a note');
    await vi.advanceTimersByTimeAsync(300);
    expect(saveReview).toHaveBeenCalledTimes(1);
    const [kind, id, entry] = saveReview.mock.calls[0];
    expect(kind).toBe('screen');
    expect(id).toBe('screen-001');
    expect(entry).toMatchObject({ note: 'a note', status: 'untouched' });
  });

  it('debounces per (kind, id) so editing two different ids saves both', async () => {
    reviewStore.setReviewStatus('screen' as EntityKind, 'screen-001', 'accepted');
    reviewStore.setReviewStatus('screen' as EntityKind, 'screen-002', 'needs-work');
    await vi.advanceTimersByTimeAsync(300);
    expect(saveReview).toHaveBeenCalledTimes(2);
  });
});

describe('markWritten', () => {
  it('stamps only updatedAt, leaving status/note/reviewedAt untouched', () => {
    reviewStore.setReviewNote('screen' as EntityKind, 'screen-001', 'a note');
    const beforeWrite = reviewStore.reviewFor('screen' as EntityKind, 'screen-001');

    reviewStore.markWritten('screen' as EntityKind, 'screen-001');
    const afterWrite = reviewStore.reviewFor('screen' as EntityKind, 'screen-001');

    expect(afterWrite.status).toBe(beforeWrite.status);
    expect(afterWrite.note).toBe(beforeWrite.note);
    expect(afterWrite.reviewedAt).toBe(beforeWrite.reviewedAt);
    expect(afterWrite.updatedAt).not.toBeNull();
  });
});
