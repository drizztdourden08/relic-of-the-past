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

  /** Pending ProfileHub tab switch — consumed once by ProfileHub the same way pendingAnchor
   *  is, so a deep-link can land on a different tab before scrolling to its anchor. */
  pendingTab: string | null;
  setPendingTab: (tab: string | null) => void;
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

  pendingTab: null,
  setPendingTab: (pendingTab) => set({ pendingTab }),
}));

/** Tab + anchor for every setting a DisabledOverlay can deep-link to, keyed by the setting's
 *  GameSettings key — one place so every overlay (widgets, Controls bindings, locked settings
 *  controls) lands on the same spot for a given cause. Both entries currently point at the
 *  same tab because both toggles live in Gameplay settings; a future gate can point elsewhere. */
const SETTINGS_TARGETS: Record<string, { tab: string; anchor: string }> = {
  vanillaSafe: { tab: 'gameplay', anchor: 'vanillaSafe' },
  cheatsEnabled: { tab: 'gameplay', anchor: 'cheatsEnabled' },
};

/**
 * Deep-links to the setting responsible for a lock: queues a ProfileHub tab switch plus the
 * anchor scroll/flash, consumed by ProfileHub's existing pendingAnchor effect. Callers already
 * on the profile page (a locked settings control) only need this; a caller elsewhere (a locked
 * widget overlay, a locked Controls binding list) additionally switches the app to the profile
 * page itself first. An id with no entry falls back to Vanilla Safe's target.
 */
const openSettingsTarget = (settingId: string): void => {
  const target = SETTINGS_TARGETS[settingId] ?? SETTINGS_TARGETS.vanillaSafe;
  useSearchStore.getState().setPendingTab(target.tab);
  useSearchStore.getState().setPendingAnchor(target.anchor);
};

/** Convenience alias for the one setting every SettingsLayout lock can ever be caused by. */
const openVanillaSafeSettings = (): void => openSettingsTarget('vanillaSafe');

export { useSearchStore, openSettingsTarget, openVanillaSafeSettings };
