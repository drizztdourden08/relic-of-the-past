/* @layer renderer-app @kind types */
interface TouchControlsState {
  /** The layout editor is open over the game. */
  editing: boolean;
  /** The mobile menu drawer is open. Shared by the back button and the hold-for-menu gesture. */
  menuOpen: boolean;
  setEditing: (editing: boolean) => void;
  setMenuOpen: (open: boolean) => void;
}

export type { TouchControlsState };
