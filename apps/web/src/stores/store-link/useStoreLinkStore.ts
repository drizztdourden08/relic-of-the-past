/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { StoreLinkStore } from './store-link.type';

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
