/* @layer renderer-stores @kind logic */
/**
 * Exclusive insets store — broadcasts the docked-widget insets computed by the
 * Widget layout system to consumers (GameLayer, overlays). The Widget composite
 * stays presentational and emits insets via a callback; views wire that callback
 * to this store, keeping store ownership out of the bare design-system tier.
 */
import { create } from 'zustand';
import type { ExclusiveInsets } from '@ds/composites/Widget';

interface ExclusiveInsetsState {
  insets: ExclusiveInsets;
  setInsets: (insets: ExclusiveInsets) => void;
}

const useExclusiveInsetsStore = create<ExclusiveInsetsState>((set) => ({
  insets: { left: 0, right: 0, top: 0, bottom: 0 },
  setInsets: (insets) => set({ insets }),
}));

export { useExclusiveInsetsStore };
export type { ExclusiveInsetsState };
