/* @layer renderer-app @kind types */
import type { TouchSnap } from '@rotp/features';
import type { ScreenBox } from '@rotp/input-mapping';

interface TouchEditorGridProps {
  box: ScreenBox;
  snap: TouchSnap;
}

export type { TouchEditorGridProps };
