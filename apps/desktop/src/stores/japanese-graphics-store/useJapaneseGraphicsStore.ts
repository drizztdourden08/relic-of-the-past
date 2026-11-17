/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { JapaneseGraphicsStore } from './japanese-graphics-store.type';

const useJapaneseGraphicsStore = create<JapaneseGraphicsStore>()((set) => ({
  available: false,
  setAvailable: (available) => set({ available }),
}));

export { useJapaneseGraphicsStore };
