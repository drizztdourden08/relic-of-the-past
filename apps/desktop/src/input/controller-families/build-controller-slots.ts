/* @layer renderer-lib @kind logic */
import type { PadState } from '@drizztdourden08/brock-input';
import { CONTROLLER_SLOT_IDS } from '@drizztdourden08/tessera/composites';
import type { ControllerSlotId, ControllerSlots } from '@drizztdourden08/tessera/composites';
import { SLOT_POSITIONS } from './controller-families.constants';
import type { DevicePositions, FamilyLayout } from './controller-families.type';
import type { GlyphOf } from './build-controller-slots.type';

const hasSlot = (id: ControllerSlotId, positions: DevicePositions): boolean =>
  (SLOT_POSITIONS[id] ?? []).every((position) => positions.has(position));

const buildControllerSlots = (
  pad: PadState, layout: FamilyLayout, positions: DevicePositions, glyphOf: GlyphOf,
): ControllerSlots => {
  const slots: ControllerSlots = {};
  for (const id of CONTROLLER_SLOT_IDS) {
    if (!hasSlot(id, positions)) continue;
    const iconId = layout.glyphs[id];
    slots[id] = { ...pad.slots[id], label: layout.labels[id], glyph: iconId === undefined ? undefined : glyphOf(iconId) };
  }
  return slots;
};

export { buildControllerSlots };
