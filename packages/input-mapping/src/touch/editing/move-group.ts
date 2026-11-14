/* @layer shared-input @kind logic */
import type { OrientationLayout } from '@rotp/features';
import type { MoveGroupOptions } from './move-group.type';
import { shiftButtons } from './shift-buttons';

const moveGroup = (layout: OrientationLayout, { groupId, delta, snap, box }: MoveGroupOptions): OrientationLayout =>
  shiftButtons(layout, (button) => button.group === groupId, { delta, snap, box });

export { moveGroup };
