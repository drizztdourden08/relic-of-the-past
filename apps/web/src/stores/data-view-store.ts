/* @layer renderer-stores @kind logic */
/**
 * Session tier of a Data Inspector-style view: scroll position, expanded group
 * rows, the selected record and any unsaved editor draft. In-memory only and
 * never written to disk — it survives switching which collection is shown
 * (so flicking back to a collection restores your place), but not an app
 * restart. Keyed the same way durable snapshots are (`ViewKey`), so a session
 * slice and its durable counterpart always line up under `useViewState`.
 */
import { create } from 'zustand';
import type { ViewKey } from '@ds/data';

interface SessionView {
  scrollTop: number;
  expanded: readonly string[];
  selectedId: string | null;
  draft?: unknown;
}

const DEFAULT_SESSION_VIEW: SessionView = {
  scrollTop: 0,
  expanded: [],
  selectedId: null,
};

interface DataViewStoreState {
  views: Partial<Record<ViewKey, SessionView>>;
  getSessionView: (key: ViewKey) => SessionView;
  setSessionView: (key: ViewKey, view: SessionView) => void;
  clearSessionView: (key: ViewKey) => void;
}

const useDataViewStore = create<DataViewStoreState>((set, get) => ({
  views: {},

  getSessionView: (key) => get().views[key] ?? DEFAULT_SESSION_VIEW,

  setSessionView: (key, view) => set((state) => ({
    views: { ...state.views, [key]: view },
  })),

  clearSessionView: (key) => set((state) => {
    const rest = { ...state.views };
    delete rest[key];
    return { views: rest };
  }),
}));

export { DEFAULT_SESSION_VIEW, useDataViewStore };
export type { DataViewStoreState, SessionView };
