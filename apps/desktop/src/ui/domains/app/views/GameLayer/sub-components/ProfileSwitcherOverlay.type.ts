/* @layer renderer-components @kind types */
import type { FunctionMapping } from '@rotp/features';
import type { InputProfile } from '@rotp/input-mapping';

interface ProfileSwitcherOverlayProps {
  open: boolean;
  profiles: InputProfile[];
  activeId: string | null;
  prevMapping: FunctionMapping | null;
  nextMapping: FunctionMapping | null;
}

export type { ProfileSwitcherOverlayProps };
