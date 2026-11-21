/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { JapaneseGraphicsStore } from './japanese-graphics-store.type';

const useJapaneseGraphicsStore = create<JapaneseGraphicsStore>()((set) => ({
  available: false,
  fontImported: false,
  menus: false,
  pause: false,
  ending: false,
  setStatus: (status) => set(status),
}));

export { useJapaneseGraphicsStore };
