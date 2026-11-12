/* @layer shared-input @kind logic */
import type { OrientationLayout, TouchButton } from '@rotp/features';

const lockedGroupOf = (layout: OrientationLayout, button: TouchButton): string | null => {
  if (button.group === null) return null;
  const group = layout.groups.find((candidate) => candidate.id === button.group);
  return group?.locked ? group.id : null;
};

export { lockedGroupOf };
