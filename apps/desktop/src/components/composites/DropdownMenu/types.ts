import type { RefObject } from 'react';

interface MenuItem {
  key: string;
  icon?: string;
  label: string;
  description?: string;
  disabled?: boolean;
  onClick?: () => void;
  children?: MenuItem[];
}

type MenuEntry = MenuItem | 'separator';

interface DropdownMenuProps {
  items: MenuEntry[];
  anchorRef?: RefObject<HTMLElement | null>;
}

export type { DropdownMenuProps, MenuEntry, MenuItem };
