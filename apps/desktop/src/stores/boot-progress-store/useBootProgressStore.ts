/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { BootProgressState } from './boot-progress-store.type';

const useBootProgressStore = create<BootProgressState>((set) => ({
  phase: 'idle',
  message: '',
  ratio: null,
  update: (patch) => set(patch),
}));

export { useBootProgressStore };
