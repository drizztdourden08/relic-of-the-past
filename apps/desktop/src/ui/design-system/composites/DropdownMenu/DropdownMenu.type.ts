/* @layer renderer-components @kind types */
import type { RefObject } from 'react';

interface MenuItem {
  key: string;
  icon?: string;
  label: string;
  description?: string;
  disabled?: boolean;
  /** When true, renders a trailing checkmark (e.g. an enabled widget). */
  checked?: boolean;
  onClick?: () => void;
  children?: MenuItem[];
}

type MenuEntry = MenuItem | 'separator';

interface DropdownMenuProps {
  items: MenuEntry[];
  anchorRef?: RefObject<HTMLElement | null>;
}

export type { DropdownMenuProps, MenuEntry, MenuItem };
