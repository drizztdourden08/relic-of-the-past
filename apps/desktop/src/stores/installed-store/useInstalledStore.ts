/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { InstalledStore } from './installed-store.type';
import { RECORD_SETTLE_MS } from './installed-store.constants';

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
      }, RECORD_SETTLE_MS);
    });
  },
}));

export { useInstalledStore };
