/* @layer shared-input @kind logic */
import { BIT } from './remap-modern.constants';
import type { FunctionMask } from './function-mask';
import type { ModernScheme, SlotAssignment } from '../../types/controls/scheme';
import type { OwnsItem } from './remap-modern.type';
import type { RemapResult } from './remap.type';

const remapModern = (pressed: FunctionMask, scheme: ModernScheme, ownsItem: OwnsItem): RemapResult => {
  const { dpad, pause, map, slots } = pressed;
  let mask = dpad;
  if (pause) mask |= BIT.Start;
  if (map) mask |= BIT.X;

  let activeItem = 0;

  for (const slotIndex of slots) {
    const assignment: SlotAssignment | undefined = scheme.assignments[slotIndex];
    if (!assignment) continue;
    if (assignment.kind === 'sword') mask |= BIT.B;
    if (assignment.kind === 'action') mask |= BIT.A;
    if (assignment.kind === 'item') {
      if (!ownsItem(assignment.hudItem)) continue;
      mask |= BIT.Y;
      if (activeItem === 0) activeItem = assignment.hudItem;
    }
  }

  return { mask, activeItem };
};

export { remapModern };
