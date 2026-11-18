/* @layer renderer-components @kind types */
import type { IconifyIcon as IconifyIconData } from '@iconify/types';
import type { FlowDirection } from '@app/hud-layout-editing/align-options';
import type { Message } from '@drizztdourden08/brock-core/i18n';

interface DirectionOption {
  value: FlowDirection;
  icon: IconifyIconData;
  label: Message;
}

interface DirectionControlProps {
  value: FlowDirection;
  onChange: (next: FlowDirection) => void;
  disabled?: boolean;
  variant?: 'field' | 'bare';
}

export type { DirectionControlProps, DirectionOption };
