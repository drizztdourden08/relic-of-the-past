/* @layer renderer-app @kind hook */
import { create } from 'zustand';
import type { UpdaterUiState } from './updater-ui-store.type';

const useUpdaterUiStore = create<UpdaterUiState>()((set) => ({
  dialogOpen: false,
  available: false,
  supported: false,
  check: null,
  setDialogOpen: (dialogOpen) => set({ dialogOpen }),
  report: ({ available, supported, check }) => set({ available, supported, check }),
}));

export { useUpdaterUiStore };
