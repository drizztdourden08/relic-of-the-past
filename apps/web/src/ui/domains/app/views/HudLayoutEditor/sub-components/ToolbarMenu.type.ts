/* @layer renderer-components @kind types */
import type { ReactNode, RefObject } from 'react';
import type { IconifyIcon as IconifyIconData } from '@iconify/types';
import type { MenuNode } from '@drizztdourden08/tessera/composites';

interface ToolbarMenuProps {
  icon: IconifyIconData;
  label: string;
  items?: MenuNode[];
  panel?: (anchorRef: RefObject<HTMLElement | null>) => ReactNode;
  open: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export type { ToolbarMenuProps };
