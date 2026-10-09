/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { ExclusiveInsetsState } from './exclusive-insets-store.type';

const useExclusiveInsetsStore = create<ExclusiveInsetsState>((set) => ({
  insets: { left: 0, right: 0, top: 0, bottom: 0 },
  setInsets: (insets) => set({ insets }),
}));

export { useExclusiveInsetsStore };
