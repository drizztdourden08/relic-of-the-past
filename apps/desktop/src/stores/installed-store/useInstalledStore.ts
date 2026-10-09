/* @layer renderer-stores @kind logic */
import { appApi } from '@app/ipc/app-api';
import { create } from 'zustand';
import type { InstalledStore } from './installed-store.type';
import { RECORD_SETTLE_MS } from './installed-store.constants';

let watching = false;
let settleTimer: ReturnType<typeof setTimeout> | null = null;

const useInstalledStore = create<InstalledStore>((set, get) => ({
  packs: [],
  reload: async () => {
    set({ packs: (await appApi().storeInstalled?.()) ?? [] });
  },
  watch: () => {
    if (watching) return;
    watching = true;
    void get().reload();
    appApi().onStoreInstallProgress?.(({ progress }) => {
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
