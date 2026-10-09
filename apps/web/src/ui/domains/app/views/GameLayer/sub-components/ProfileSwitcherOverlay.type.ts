/* @layer renderer-components @kind types */
import type { FunctionMapping, InputProfile } from '@shared/types/controls';

interface ProfileSwitcherOverlayProps {
  open: boolean;
  profiles: InputProfile[];
  activeId: string | null;
  prevMapping: FunctionMapping | null;
  nextMapping: FunctionMapping | null;
}

export type { ProfileSwitcherOverlayProps };
