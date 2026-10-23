/* @layer renderer-lib @kind logic */
import type { DevicePositions, LayoutFamily } from '../controller-families/controller-families.type';
import { CONTROLLER_OVERRIDES } from './controller-overrides.constants';
import { FAMILY_OVERLAYS } from './family-overlays.constants';
import { mergeSlots } from './merge-slot';
import type { FamilyOverlay, VidPid } from './pad-overlay.type';
import { slotPositions } from './slot-positions';

const resolveOverlay = (family: LayoutFamily, key: VidPid, positions: DevicePositions): FamilyOverlay => {
  const override = CONTROLLER_OVERRIDES[key];
  const base = FAMILY_OVERLAYS[override?.family ?? family];
  const slots = mergeSlots(base.slots, override?.slots)
    .filter((slot) => slotPositions(slot).every((position) => positions.has(position)));
  return { variant: override?.variant ?? base.variant, slots };
};

export { resolveOverlay };
