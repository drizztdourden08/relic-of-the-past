/* @layer renderer-components @kind logic */
/**
 * The reusable binding: point a composite at a `ViewKey` and it gets durable +
 * session view state for free; omit the key and it gets a purely in-memory,
 * unpersisted snapshot — no IPC call, no store write — which is what lets a
 * composite be used with zero persistence setup outside the inspector.
 *
 * This is the one file under ds/data/ allowed to reach into app-level renderer
 * code (`lib/storage`, `stores`) — see the data-inspector plan §8/§11. Every
 * other module in this folder stays headless and does not know either exists.
 */
import { useCallback, useEffect, useState } from 'react';
import { loadViewSnapshot, saveViewSnapshot } from '@app/lib/storage/ui-views';
import { useDataViewStore } from '@app/stores/data-view-store';
import type { SessionView } from '@app/stores/data-view-store';
import type { SchemaLike } from '../schema/build-schema';
import type { TableColumn } from '../table/types';
import { beginDurableLoad, createLoadGuard, emptySnapshotFor } from './durable-load';
import type { ViewKey, ViewSnapshot } from './snapshot';

const DEFAULT_SESSION_VIEW: SessionView = {
  scrollTop: 0,
  expanded: [],
  selectedId: null,
};

interface UseViewStateResult {
  snapshot: ViewSnapshot;
  sessionView: SessionView;
  /** Updates local state immediately and debounce-saves the durable half. */
  setSnapshot: (next: ViewSnapshot) => void;
  /** Writes straight to the session store (or local state, keyless) — no debounce. */
  setSessionView: (next: SessionView) => void;
}

const useViewState = (
  key: ViewKey | undefined,
  schema: SchemaLike,
  fallbackColumns: readonly TableColumn[],
): UseViewStateResult => {
  const [localSnapshot, setLocalSnapshot] = useState<ViewSnapshot>(() => emptySnapshotFor(fallbackColumns));
  const [localSession, setLocalSession] = useState<SessionView>(DEFAULT_SESSION_VIEW);
  // Built once per hook instance (lazy initialiser, not a fresh one per render):
  // it decides whether a read that has just come back still describes what the
  // user is looking at, or whether they have moved on without it.
  const [loadGuard] = useState(createLoadGuard);

  // A constant selector output (DEFAULT_SESSION_VIEW) when there's no key means this
  // never re-renders off store activity — as inert as not subscribing at all.
  const storedSession = useDataViewStore((state) => (key ? state.views[key] ?? DEFAULT_SESSION_VIEW : DEFAULT_SESSION_VIEW));
  const setStoredSession = useDataViewStore((state) => state.setSessionView);

  useEffect(() => {
    if (!key) {
      loadGuard.cancel();
      return;
    }
    beginDurableLoad({
      guard: loadGuard,
      load: () => loadViewSnapshot(key),
      schema,
      fallbackColumns,
      apply: setLocalSnapshot,
    });
    // A new key opens its own generation, so the outgoing one's read can no
    // longer land — and it starts unwritten, so switching collections still
    // restores what that collection had saved.
    return () => { loadGuard.cancel(); };
    // Re-running on `key` alone is deliberate: the schema/fallback only matter at
    // load time (later drift is handled by prune() on the next load), and pulling
    // them into the deps would re-trigger a fresh disk read on every re-render.
  }, [key]);

  const setSnapshot = useCallback((next: ViewSnapshot) => {
    // Retire the in-flight read BEFORE the write: what the user just did is by
    // definition newer than anything the disk was asked for before they did it.
    loadGuard.markEdited();
    setLocalSnapshot(next);
    if (key) saveViewSnapshot(key, next);
  }, [key]);

  const setSessionView = useCallback((next: SessionView) => {
    if (key) setStoredSession(key, next);
    else setLocalSession(next);
  }, [key, setStoredSession]);

  return {
    snapshot: localSnapshot,
    sessionView: key ? storedSession : localSession,
    setSnapshot,
    setSessionView,
  };
};

export { useViewState };
export type { UseViewStateResult };
