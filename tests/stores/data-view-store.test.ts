/* @layer test @kind test */
import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_SESSION_VIEW, useDataViewStore } from '../../apps/web/src/stores/data-view-store';
import type { ViewKey } from '../../apps/web/src/ui/design-system/data/view-state/snapshot';

// Session state (scroll, expanded groups, selection, draft) is in-memory only
// and keyed the same way durable snapshots are. The one property that matters
// here is isolation: touching one collection's session view must never leak
// into another's, and a key nobody has written to yet reads as the default.

const SCREEN = 'data-inspector:screen' as ViewKey;
const ITEM = 'data-inspector:item' as ViewKey;

beforeEach(() => {
  useDataViewStore.setState({ views: {} });
});

describe('data-view-store — per-key isolation', () => {
  it('reads the default session view for a key nothing has touched', () => {
    expect(useDataViewStore.getState().getSessionView(SCREEN)).toEqual(DEFAULT_SESSION_VIEW);
  });

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

  it('keeps two surfaces viewing the same collection independent (surface:collection keying)', () => {
    const inInspector = 'data-inspector:connection' as ViewKey;
    const inNavWidget = 'nav-widget:connection' as ViewKey;

    useDataViewStore.getState().setSessionView(inInspector, { ...DEFAULT_SESSION_VIEW, scrollTop: 50 });
    useDataViewStore.getState().setSessionView(inNavWidget, { ...DEFAULT_SESSION_VIEW, scrollTop: 900 });

    expect(useDataViewStore.getState().getSessionView(inInspector).scrollTop).toBe(50);
    expect(useDataViewStore.getState().getSessionView(inNavWidget).scrollTop).toBe(900);
  });

  it('carries an unsaved editor draft only for the key it was set on', () => {
    const draft = { name: 'edited but unsaved' };
    useDataViewStore.getState().setSessionView(SCREEN, { ...DEFAULT_SESSION_VIEW, draft });

    expect(useDataViewStore.getState().getSessionView(SCREEN).draft).toEqual(draft);
    expect(useDataViewStore.getState().getSessionView(ITEM).draft).toBeUndefined();
  });

  it('clearSessionView removes only the named key, falling back to the default', () => {
    useDataViewStore.getState().setSessionView(SCREEN, { ...DEFAULT_SESSION_VIEW, scrollTop: 10 });
    useDataViewStore.getState().setSessionView(ITEM, { ...DEFAULT_SESSION_VIEW, scrollTop: 20 });

    useDataViewStore.getState().clearSessionView(SCREEN);

    expect(useDataViewStore.getState().getSessionView(SCREEN)).toEqual(DEFAULT_SESSION_VIEW);
    expect(useDataViewStore.getState().getSessionView(ITEM).scrollTop).toBe(20);
  });

  it('replaces the whole session view rather than merging partial patches', () => {
    useDataViewStore.getState().setSessionView(SCREEN, { ...DEFAULT_SESSION_VIEW, scrollTop: 10, selectedId: 'screen-1' });
    useDataViewStore.getState().setSessionView(SCREEN, { ...DEFAULT_SESSION_VIEW, scrollTop: 30 });

    // The second call carried no selectedId, and whole-object semantics mean
    // it is gone, not merged forward from the first call.
    expect(useDataViewStore.getState().getSessionView(SCREEN)).toEqual({ ...DEFAULT_SESSION_VIEW, scrollTop: 30 });
  });
});
