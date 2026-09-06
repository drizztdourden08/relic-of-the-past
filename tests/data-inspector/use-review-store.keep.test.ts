/* @layer tests @kind test */
/**
 * `useReviewStore` wraps `review-store.ts` in `useSyncExternalStore`. Pinned:
 * the untouched default for an unreviewed id, and bound setters reaching the
 * same store. Rendered via `renderToStaticMarkup` (as `use-view-state.test.ts`
 * does): subscribe/getSnapshot run during render, so that is enough.
 */
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { EntityKind } from '../../shared/game/data';
import type { UseReviewStoreResult } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/use-review-store';
import type * as UseReviewStoreModule from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/use-review-store';

let loadReview: ReturnType<typeof vi.fn>;
let saveReview: ReturnType<typeof vi.fn>;
let useReviewStore: typeof UseReviewStoreModule.useReviewStore;

beforeEach(async () => {
  vi.resetModules();
  loadReview = vi.fn().mockResolvedValue({});
  saveReview = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('window', { api: { loadReview, saveReview } });
  ({ useReviewStore } = await import(
    '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/use-review-store'
  ));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const renderHarness = (kind: EntityKind): UseReviewStoreResult => {
  let captured: UseReviewStoreResult | undefined;
  const Harness = (): null => {
    captured = useReviewStore(kind);
    return null;
  };
  renderToStaticMarkup(React.createElement(Harness));
  if (!captured) throw new Error('useReviewStore did not run');
  return captured;
};

describe('useReviewStore', () => {
  it('answers the untouched default for an id with no saved entry', () => {
    const { reviewFor } = renderHarness('screen' as EntityKind);
    expect(reviewFor('screen-001')).toEqual({ status: 'untouched', note: '', reviewedAt: null, updatedAt: null });
  });

  it('triggers a load for the kind it was rendered with', () => {
    renderHarness('connection' as EntityKind);
    expect(loadReview).toHaveBeenCalledWith('connection');
  });

  it('setReviewStatus reaches the same store a plain caller would read', () => {
    const { setReviewStatus, reviewFor } = renderHarness('screen' as EntityKind);
    setReviewStatus('screen-001', 'accepted');
    expect(reviewFor('screen-001').status).toBe('accepted');
  });
});
