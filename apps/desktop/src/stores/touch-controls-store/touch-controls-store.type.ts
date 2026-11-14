/* @layer renderer-app @kind types */
interface TouchControlsState {
  editing: boolean;
  menuOpen: boolean;
  setEditing: (editing: boolean) => void;
  setMenuOpen: (open: boolean) => void;
}

export type { TouchControlsState };
