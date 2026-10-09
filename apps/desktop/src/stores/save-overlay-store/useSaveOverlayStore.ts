/* @layer renderer-app @kind hook */
import { create } from 'zustand';
import type { SaveOverlayState } from './save-overlay-store.type';

const useSaveOverlayStore = create<SaveOverlayState>()((set) => ({
  shown: false,
  toggle: () => set((state) => ({ shown: !state.shown })),
  hide: () => set({ shown: false }),
}));

export { useSaveOverlayStore };
