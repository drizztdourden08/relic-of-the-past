/* @layer test @kind test */
import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_SESSION_VIEW, useDataViewStore } from '../../src/stores/data-view-store';
import type { ViewKey } from '@drizztdourden08/tessera/data';

const SCREEN = 'data-inspector:screen' as ViewKey;
const ITEM = 'data-inspector:item' as ViewKey;

beforeEach(() => {
  useDataViewStore.setState({ views: {}, pendingRecord: null, pendingRecommendation: null });
});

describe('data-view-store keeps per-key isolation', { tags: ['critical'] }, () => {
  it('setSessionView for one key does not affect another', () => {
    useDataViewStore.getState().setSessionView(SCREEN, {
      scrollTop: 120,
      expanded: ['group-a'],
      selectedId: 'screen-183',
    });

    expect(useDataViewStore.getState().getSessionView(SCREEN)).toEqual({
      scrollTop: 120,
      expanded: ['group-a'],
      selectedId: 'screen-183',
    });
    expect(useDataViewStore.getState().getSessionView(ITEM)).toEqual(DEFAULT_SESSION_VIEW);
  });

  it('clearSessionView removes only the named key, falling back to the default', () => {
    useDataViewStore.getState().setSessionView(SCREEN, { ...DEFAULT_SESSION_VIEW, scrollTop: 10 });
    useDataViewStore.getState().setSessionView(ITEM, { ...DEFAULT_SESSION_VIEW, scrollTop: 20 });

    useDataViewStore.getState().clearSessionView(SCREEN);

    expect(useDataViewStore.getState().getSessionView(SCREEN)).toEqual(DEFAULT_SESSION_VIEW);
    expect(useDataViewStore.getState().getSessionView(ITEM).scrollTop).toBe(20);
  });
});
