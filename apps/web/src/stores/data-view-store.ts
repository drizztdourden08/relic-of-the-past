/* @layer renderer-stores @kind logic */
/**
 * Session tier of a Data Inspector-style view: scroll position, expanded group
 * rows, the selected record and any unsaved editor draft. In-memory only and
 * never written to disk — it survives switching which collection is shown
 * (so flicking back to a collection restores your place), but not an app
 * restart. Keyed the same way durable snapshots are (`ViewKey`), so a session
 * slice and its durable counterpart always line up under `useViewState`.
 *
 * It also carries the one REQUEST any surface can make of that view: open this
 * recommendation. A widget cannot reach the page state (it is `useState` in the
 * app shell), so the two halves meet here — the shell registers how to bring the
 * inspector to the front, a caller hands over what to show, and the inspector
 * consumes it once it has landed. Same shape as the search palette's
 * `registerSettings` / `pendingAnchor` pair, for the same reason.
 *
 * `pendingRecord` is the same handoff for a PLAIN record rather than a finding
 * — a widget's own "Edit" button, or a reference it renders, wants to jump to
 * one exact record in its own collection, not to a comparison view.
 */
import { create } from 'zustand';
import type { ViewKey } from '@ds/data';
import type { EntityKind } from '@shared/game/data';
import type { Recommendation } from '@shared/game/recommendations';

interface PendingRecord {
  kind: EntityKind;
  id: string;
}

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

  /** What the Data Inspector has been asked to open, until it has opened it. */
  pendingRecommendation: Recommendation | null;
  /**
   * Shows one recommendation in the Data Inspector's comparison view, from
   * anywhere — a widget, a HUD panel, a keyboard shortcut. Brings the inspector
   * to the front (when the app shell has registered how) and leaves the entry
   * standing as `pendingRecommendation` for the view to pick up on arrival.
   */
  openRecommendation: (recommendation: Recommendation) => void;
  /** The view has shown it; the request is spent. */
  clearPendingRecommendation: () => void;

  /** What the Data Inspector has been asked to open, until it has opened it. */
  pendingRecord: PendingRecord | null;
  /** Shows one record in the Data Inspector, from anywhere — same bargain as `openRecommendation`. */
  openRecord: (kind: EntityKind, id: string) => void;
  /** The view has shown it; the request is spent. */
  clearPendingRecord: () => void;

  /** The app shell publishing how to bring the inspector page to the front. */
  registerInspectorOpener: (open: (() => void) | null) => void;
}

/**
 * Kept beside the store rather than in it: it is a capability the shell lends,
 * not state anything renders, and holding it in the store would re-render every
 * subscriber each time the shell re-registered.
 */
let inspectorOpener: (() => void) | null = null;

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

  pendingRecommendation: null,

  // The opener is called AFTER the request is stored, so a shell that renders
  // the inspector synchronously still finds something waiting for it.
  openRecommendation: (recommendation) => {
    set({ pendingRecommendation: recommendation });
    inspectorOpener?.();
  },

  clearPendingRecommendation: () => set({ pendingRecommendation: null }),

  pendingRecord: null,

  openRecord: (kind, id) => {
    set({ pendingRecord: { kind, id } });
    inspectorOpener?.();
  },

  clearPendingRecord: () => set({ pendingRecord: null }),

  registerInspectorOpener: (open) => { inspectorOpener = open; },
}));

export { DEFAULT_SESSION_VIEW, useDataViewStore };
export type { DataViewStoreState, PendingRecord, SessionView };
