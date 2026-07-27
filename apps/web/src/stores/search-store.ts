/* @layer renderer-stores @kind logic */
/** Global search palette: open/query state, a settings read/write bridge registered by
 *  whichever view currently owns GameSettings (ProfileHub), and a pending deep-link anchor
 *  consumed once by the settings screen after navigation lands. */
import { create } from 'zustand';
import type { GameSettings } from '@shared/types/settings';

interface SearchStore {
  open: boolean;
  query: string;
  openPalette: () => void;
  closePalette: () => void;
  setQuery: (query: string) => void;

  settings: GameSettings | null;
  applyPatch: ((patch: Partial<GameSettings>) => void) | null;
  registerSettings: (settings: GameSettings, apply: (patch: Partial<GameSettings>) => void) => void;
  clearSettings: () => void;

  pendingAnchor: string | null;
  setPendingAnchor: (anchor: string | null) => void;
}

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
}));

export { useSearchStore };
