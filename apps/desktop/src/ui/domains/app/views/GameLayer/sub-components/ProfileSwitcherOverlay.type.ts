/* @layer renderer-components @kind types */
import type { FunctionMapping } from '@rotp/features';
import type { InputProfile } from '@shared/types/controls/devices/devices.type';

interface ProfileSwitcherOverlayProps {
  open: boolean;
  profiles: InputProfile[];
  activeId: string | null;
  prevMapping: FunctionMapping | null;
  nextMapping: FunctionMapping | null;
}

export type { ProfileSwitcherOverlayProps };
