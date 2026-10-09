/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import { INACTIVE_FRAME, wasmDialogMarkStale } from '@rotp/game-core';
import type { DialogStore } from './dialog-store.type';

const useDialogStore = create<DialogStore>()((set, get) => ({
  frame: INACTIVE_FRAME,
  stale: false,
  staleGeneration: 0,
  _setFrame: (frame) => {
    const { stale, staleGeneration } = get();
    const isSeenAgain = !frame.active || frame.generation !== staleGeneration;
    set({ frame, stale: stale && !isSeenAgain });
  },
  markStale: () => {
    wasmDialogMarkStale();
    set({ stale: true, staleGeneration: get().frame.generation });
  },
  markRestored: () => set({ stale: false }),
}));

export { useDialogStore };
