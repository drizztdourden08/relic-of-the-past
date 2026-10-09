/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { DataViewStoreState } from './data-view-store.type';
import { DEFAULT_SESSION_VIEW } from './data-view-store.constants';

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

export { useDataViewStore };
