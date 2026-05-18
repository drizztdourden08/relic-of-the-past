import type { RefObject } from 'react';

export interface MenuItem {
  key: string;
  icon?: string;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  children?: MenuItem[];
}

export type MenuEntry = MenuItem | 'separator';

export interface DropdownMenuProps {
  items: MenuEntry[];
  anchorRef?: RefObject<HTMLElement | null>;
}
