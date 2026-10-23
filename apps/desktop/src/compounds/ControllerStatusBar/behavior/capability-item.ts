/* @layer renderer-components @kind logic */
import { ABSENT_LABEL, CAPABILITY_ICON, PRESENT_LABEL } from '../ControllerStatusBar.constants';
import type { StatusItemProps } from '../ControllerStatusBar.type';
import type { Capability } from './status-items.type';

const capabilityItem = (capability: Capability, present: boolean | undefined, showAbsent: boolean): StatusItemProps | null => {
  const icon = CAPABILITY_ICON[capability];
  if (present) return { icon, label: PRESENT_LABEL[capability] };
  return showAbsent ? { icon, label: ABSENT_LABEL[capability], dim: true } : null;
};

export { capabilityItem };
