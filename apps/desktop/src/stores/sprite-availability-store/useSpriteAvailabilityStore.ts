/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { SpriteAvailabilityStore } from './sprite-availability-store.type';

const useSpriteAvailabilityStore = create<SpriteAvailabilityStore>()((set) => ({
  romFile: null,
  available: false,
  revision: 0,
  setAvailability: (romFile, available) => set({ romFile, available }),
  noteSpritesRewritten: () => set((state) => ({ revision: state.revision + 1 })),
}));

export { useSpriteAvailabilityStore };
