/* @layer renderer-stores @kind logic */
/**
 * A store install link waiting for the Hookshop tab. The shell puts it here and opens the
 * tab; the tab takes it once, selects the item and starts the install. A store because the
 * link can arrive while any page is open, before the tab is mounted.
 */
import { create } from 'zustand';
import type { StoreOpenInstall } from '@shared/ipc';

interface StoreLinkStore {
  pending: StoreOpenInstall | null;
  offer: (link: StoreOpenInstall) => void;
  /** The pending link, cleared, so it installs once. */
  take: () => StoreOpenInstall | null;
}

const useStoreLinkStore = create<StoreLinkStore>((set, get) => ({
  pending: null,
  offer: (link) => set({ pending: link }),
  take: () => {
    const { pending } = get();
    if (pending) set({ pending: null });
    return pending;
  },
}));

export { useStoreLinkStore };
export type { StoreLinkStore };
