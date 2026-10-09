/* @layer renderer-stores @kind types */
interface ExclusiveInsets {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface ExclusiveInsetsState {
  insets: ExclusiveInsets;
  setInsets: (insets: ExclusiveInsets) => void;
}

export type { ExclusiveInsets, ExclusiveInsetsState };
