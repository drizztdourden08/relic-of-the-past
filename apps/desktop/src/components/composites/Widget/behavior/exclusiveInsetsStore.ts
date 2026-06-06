/* @layer renderer-components @kind logic */
/**
 * Tiny Zustand store to broadcast exclusive insets from the widget layout system
 * to the game layer and overlays.
 */
import { create } from 'zustand';
import type { ExclusiveInsets } from './computeDockedStyles';

interface ExclusiveInsetsState {
  insets: ExclusiveInsets;
  setInsets: (insets: ExclusiveInsets) => void;
}

const useExclusiveInsetsStore = create<ExclusiveInsetsState>((set) => ({
  insets: { left: 0, right: 0, top: 0, bottom: 0 },
  setInsets: (insets) => set({ insets }),
}));

export { useExclusiveInsetsStore };
