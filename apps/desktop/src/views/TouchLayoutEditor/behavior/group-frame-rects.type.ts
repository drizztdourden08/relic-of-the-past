/* @layer renderer-app @kind types */
import type { TouchGroupFrameRect } from '@app/compounds/TouchGroupFrame';

interface GroupFrameEntry {
  id: string;
  locked: boolean;
  rect: TouchGroupFrameRect;
}

export type { GroupFrameEntry };
