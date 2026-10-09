/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { SearchStore } from './search-store.type';

const useSearchStore = create<SearchStore>((set) => ({
  open: false,
  query: '',
  openPalette: () => set({ open: true }),
  closePalette: () => set({ open: false, query: '' }),
  setQuery: (query) => set({ query }),

  settings: null,
  applyPatch: null,
  registerSettings: (settings, apply) => set({ settings, applyPatch: apply }),
  clearSettings: () => set({ settings: null, applyPatch: null }),

  pendingAnchor: null,
  setPendingAnchor: (pendingAnchor) => set({ pendingAnchor }),

  pendingTab: null,
  setPendingTab: (pendingTab) => set({ pendingTab }),
}));

export { useSearchStore };
