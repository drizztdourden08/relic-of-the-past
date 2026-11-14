/* @layer renderer-app @kind types */
import type { TouchSnap } from '@rotp/features';
import type { ScreenBox, SnapGuides } from '@rotp/input-mapping';

interface TouchEditorGridProps {
  box: ScreenBox;
  snap: TouchSnap;
  guides: SnapGuides | null;
}

export type { TouchEditorGridProps };
