/* @layer renderer-stores @kind logic */
/**
 * Whether the running game is playing the text that is currently on disk.
 *
 * The assets blob reaches the emulator ONCE — a profile load reads it from
 * disk, and the game boots with it. Nothing re-reads it afterwards, and loading
 * a save state restores emulated memory rather than the blob, so an edit saved
 * while a game is running is on disk, baked, and invisible until the profile is
 * loaded again. That trap is what this store exists to surface.
 *
 * It counts BAKES rather than comparing files: every rebuild of the blob bumps
 * the generation, a boot records the generation it took, and the two drifting
 * apart is the whole signal. Comparing the files themselves would mean hashing
 * a multi-megabyte blob on every save to learn something a counter already
 * knows.
 *
 * The reload itself is a capability the app shell lends — it owns the profile
 * and the game lifecycle, neither of which a data screen can reach. Same
 * bargain the data view store strikes with the inspector, and kept beside the
 * store for the same reason: re-registering it costs no subscriber a render.
 */
import { create } from 'zustand';

interface GameAssetsState {
  /** Bumped every time the assets on disk are rebuilt. */
  bakedGeneration: number;
  /** The generation the running game booted with; null when nothing is running. */
  bootedGeneration: number | null;
  /** The profile whose text the running game took, for naming it in the warning. */
  runningProfileName: string | null;
  /** The assets on disk were rebuilt, so anything already running is behind. */
  markBaked: () => void;
  /** A game just booted with the assets as they stand on disk. */
  markBooted: () => void;
  /** Nothing is running any more; there is nothing to be out of date. */
  clearBooted: () => void;
  /** The shell publishing which profile is loaded and how to reload it. */
  registerReload: (profileName: string | null, reload: (() => void) | null) => void;
  /** True while the shell has somewhere to send a reload. */
  canReload: boolean;
  /** Reloads the profile, which re-reads the blob and reboots the core. */
  reload: () => void;
}

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

/** The running game booted before the newest bake, so it is playing older text. */
const useAssetsOutOfDate = (): boolean => useGameAssetsStore(
  (state) => state.bootedGeneration !== null && state.bootedGeneration !== state.bakedGeneration,
);

/** Callable from outside React — the storage layer bumps this after a rebake. */
const markAssetsBaked = (): void => { useGameAssetsStore.getState().markBaked(); };

export { markAssetsBaked, useAssetsOutOfDate, useGameAssetsStore };
export type { GameAssetsState };
