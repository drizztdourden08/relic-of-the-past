/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { JapaneseGraphicsStore } from './japanese-graphics-store.type';

const useJapaneseGraphicsStore = create<JapaneseGraphicsStore>()((set) => ({
  available: false,
  fontImported: false,
  setStatus: ({ available, fontImported }) => set({ available, fontImported }),
}));

export { useJapaneseGraphicsStore };
