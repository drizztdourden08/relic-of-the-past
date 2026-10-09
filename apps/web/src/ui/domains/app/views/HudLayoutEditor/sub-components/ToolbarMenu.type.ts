/* @layer renderer-components @kind types */
import type { ReactNode, RefObject } from 'react';
import type { IconifyIcon as IconifyIconData } from '@iconify/types';
import type { MenuEntry } from '@ds/composites/DropdownMenu';

interface ToolbarMenuProps {
  icon: IconifyIconData;
  label: string;
  items?: MenuEntry[];
  panel?: (anchorRef: RefObject<HTMLElement | null>) => ReactNode;
  open: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export type { ToolbarMenuProps };
