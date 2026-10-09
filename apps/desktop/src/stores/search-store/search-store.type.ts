/* @layer renderer-stores @kind types */
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

  pendingTab: string | null;
  setPendingTab: (tab: string | null) => void;
}

export type { SearchStore };
