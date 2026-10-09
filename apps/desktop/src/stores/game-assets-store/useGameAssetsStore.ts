/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { GameAssetsState } from './game-assets-store.type';

let reloadProfile: (() => void) | null = null;

const useGameAssetsStore = create<GameAssetsState>((set) => ({
  bakedGeneration: 0,
  bootedGeneration: null,
  runningProfileName: null,
  canReload: false,

  markBaked: () => set((state) => ({ bakedGeneration: state.bakedGeneration + 1 })),

  markBooted: () => set((state) => ({ bootedGeneration: state.bakedGeneration })),

  clearBooted: () => set({ bootedGeneration: null }),

  registerReload: (profileName, reload) => {
    reloadProfile = reload;
    set({ canReload: reload !== null, runningProfileName: profileName });
  },

  reload: () => { reloadProfile?.(); },
}));

export { useGameAssetsStore };
