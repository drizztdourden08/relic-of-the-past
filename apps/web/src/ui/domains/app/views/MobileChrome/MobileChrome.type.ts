/* @layer renderer-components @kind types */
/** Flattened menu item the Options drawer renders (a subset of the dropdown shape). */
interface DrawerMenuItem {
  key: string;
  icon?: string;
  label: string;
  onClick?: () => void;
  checked?: boolean;
  disabled?: boolean;
  children?: DrawerMenuItem[];
}

export type { DrawerMenuItem };
