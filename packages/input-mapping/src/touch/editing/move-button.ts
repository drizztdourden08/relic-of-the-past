/* @layer shared-input @kind logic */
import type { OrientationLayout } from '@rotp/features';
import { lockedGroupOf } from './locked-group-of';
import type { MoveButtonOptions } from './move-button.type';
import { shiftButtons } from './shift-buttons';

const moveButton = (layout: OrientationLayout, { id, delta, snap, box }: MoveButtonOptions): OrientationLayout => {
  const dragged = layout.buttons.find((button) => button.id === id);
  if (!dragged) return layout;
  const groupId = lockedGroupOf(layout, dragged);
  return shiftButtons(layout, (button) => button.id === id || (groupId !== null && button.group === groupId), { delta, snap, box });
};

export { moveButton };
