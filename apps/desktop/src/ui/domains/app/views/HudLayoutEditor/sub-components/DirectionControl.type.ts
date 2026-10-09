/* @layer renderer-components @kind types */
import type { IconifyIcon as IconifyIconData } from '@iconify/types';
import type { FlowDirection } from '../behavior/align-options';

interface DirectionOption {
  value: FlowDirection;
  icon: IconifyIconData;
  label: string;
}

interface DirectionControlProps {
  value: FlowDirection;
  onChange: (next: FlowDirection) => void;
  disabled?: boolean;
  variant?: 'field' | 'bare';
}

export type { DirectionControlProps, DirectionOption };
