/* @layer renderer-app @kind hook */
import { create } from 'zustand';
import type { TouchControlsState } from './touch-controls-store.type';

const useTouchControlsStore = create<TouchControlsState>()((set) => ({
  editing: false,
  menuOpen: false,
  setEditing: (editing) => set({ editing }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
}));

export { useTouchControlsStore };
