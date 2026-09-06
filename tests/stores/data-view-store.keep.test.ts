/* @layer test @kind test */
import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_SESSION_VIEW, useDataViewStore } from '../../apps/web/src/stores/data-view-store';
import type { ViewKey } from '../../apps/web/src/ui/design-system/data/view-state/snapshot';

// Session state is in-memory, keyed like durable snapshots. Pinned: isolation
// (one collection's view never leaks into another's) and the default for an
// unwritten key.

const SCREEN = 'data-inspector:screen' as ViewKey;
const ITEM = 'data-inspector:item' as ViewKey;

beforeEach(() => {
  useDataViewStore.setState({ views: {}, pendingRecord: null, pendingRecommendation: null });
});

describe('data-view-store keeps per-key isolation', () => {
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

  it('replaces the whole session view instead of merging partial patches', () => {
    useDataViewStore.getState().setSessionView(SCREEN, { ...DEFAULT_SESSION_VIEW, scrollTop: 10, selectedId: 'screen-1' });
    useDataViewStore.getState().setSessionView(SCREEN, { ...DEFAULT_SESSION_VIEW, scrollTop: 30 });

    // The second call carried no selectedId, and whole-object semantics mean
    // it is gone, not merged forward from the first call.
    expect(useDataViewStore.getState().getSessionView(SCREEN)).toEqual({ ...DEFAULT_SESSION_VIEW, scrollTop: 30 });
  });
});

// `openRecord` is the plain-record sibling of `openRecommendation`: same
// bargain (stash the request, ring the registered opener), a different field
// so a pending finding and a pending plain record never clobber each other.
describe('data-view-store openRecord, the plain-record handoff', () => {
  it('starts with nothing pending', () => {
    expect(useDataViewStore.getState().pendingRecord).toBeNull();
  });

  it('stashes the kind and id an edit button (or a reference) asked for', () => {
    useDataViewStore.getState().openRecord('connection', 'connection-042');
    expect(useDataViewStore.getState().pendingRecord).toEqual({ kind: 'connection', id: 'connection-042' });
  });

  it('rings the registered opener, same as openRecommendation does', () => {
    let rung = 0;
    useDataViewStore.getState().registerInspectorOpener(() => { rung += 1; });
    useDataViewStore.getState().openRecord('screen', 'screen-183');
    expect(rung).toBe(1);
    useDataViewStore.getState().registerInspectorOpener(null);
  });

  it('does nothing when nothing is registered to open', () => {
    useDataViewStore.getState().registerInspectorOpener(null);
    expect(() => useDataViewStore.getState().openRecord('item', 'item-001')).not.toThrow();
  });

  it('clearPendingRecord spends the request without touching pendingRecommendation', () => {
    useDataViewStore.getState().openRecord('actor', 'actor-007');
    useDataViewStore.getState().clearPendingRecord();
    expect(useDataViewStore.getState().pendingRecord).toBeNull();
    expect(useDataViewStore.getState().pendingRecommendation).toBeNull();
  });

  it('a later openRecord call replaces an earlier still-pending one', () => {
    useDataViewStore.getState().openRecord('connection', 'connection-001');
    useDataViewStore.getState().openRecord('connection', 'connection-002');
    expect(useDataViewStore.getState().pendingRecord).toEqual({ kind: 'connection', id: 'connection-002' });
  });
});
