/* @layer renderer-app @kind types */
interface UpdaterUiState {
  dialogOpen: boolean;
  available: boolean;
  supported: boolean;
  check: (() => void) | null;
  setDialogOpen: (open: boolean) => void;
  report: (status: { available: boolean; supported: boolean; check: () => void }) => void;
}

export type { UpdaterUiState };
