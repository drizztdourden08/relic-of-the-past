/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { IconifyIcon } from '@iconify/types';

type ToolbarButtonProps = {
  id: string;
  icon: IconifyIcon;
  label: string;
  disabled?: boolean;
  open?: boolean;
  popover?: ReactNode;
  onPress: (id: string) => void;
};

export type { ToolbarButtonProps };
