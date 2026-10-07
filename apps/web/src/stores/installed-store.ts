/* @layer renderer-stores @kind logic */
/**
 * What the Hookshop installed on this computer, read from the main process's record. One store
 * for the Hookshop tab and every editor, so an install, an update, an uninstall or a duplicate
 * shows its lock everywhere at once. `watch` also hears install progress: the last unpack step
 * of any install schedules a reload, a moment later, once the record has been written.
 */
import { create } from 'zustand';
import type { InstalledPack } from '@shared/store/installed-types';
import type { StoreKind } from '@shared/store/types';

/** The main process writes the record just after the last unpack report. */
const SETTLE_MS = 800;

interface InstalledStore {
  packs: InstalledPack[];
  /** Reads the record again. Off Electron there is none, so the list stays empty. */
  reload: () => Promise<void>;
  /** Loads the record and starts listening to install progress. Later calls do nothing. */
  watch: () => void;
}

let watching = false;
let settleTimer: ReturnType<typeof setTimeout> | null = null;

const useInstalledStore = create<InstalledStore>((set, get) => ({
  packs: [],
  reload: async () => {
    set({ packs: (await window.api.storeInstalled?.()) ?? [] });
  },
  watch: () => {
    if (watching) return;
    watching = true;
    void get().reload();
    window.api.onStoreInstallProgress?.(({ progress }) => {
      if (progress.phase !== 'unpack' || progress.total === null || progress.done < progress.total) return;
      if (settleTimer !== null) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        settleTimer = null;
        void get().reload();
      }, SETTLE_MS);
    });
  },
}));

/** The install record of one item, by its kind and the name it has on disk; null for the player's own. */
const installedFor = (kind: StoreKind, name: string | null) =>
  (state: InstalledStore): InstalledPack | null =>
    (name === null ? null : state.packs.find((pack) => pack.kind === kind && pack.installedName === name) ?? null);

export { useInstalledStore, installedFor };
export type { InstalledStore };
