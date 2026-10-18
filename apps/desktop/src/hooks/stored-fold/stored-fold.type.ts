/* @layer renderer-components @kind types */
interface StoredFold {
  collapsed: boolean;
  toggle: () => void;
  expand: () => void;
}

export type { StoredFold };
