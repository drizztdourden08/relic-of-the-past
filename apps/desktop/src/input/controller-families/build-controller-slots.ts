/* @layer renderer-lib @kind logic */
import type { PadState } from '@drizztdourden08/brock-input';
import type { ControllerExtra, ControllerSlotId, ControllerSlots } from '@drizztdourden08/tessera/composites';
import { EXTRA_POSITIONS, SLOT_POSITIONS } from './controller-families.constants';
import type { DevicePositions, ExtraSlotId, FamilyLayout } from './controller-families.type';
import type { ControllerSlotSet, GlyphOf } from './build-controller-slots.type';

const hasSlot = (id: ControllerSlotId, positions: DevicePositions): boolean =>
  (SLOT_POSITIONS[id] ?? []).every((position) => positions.has(position));

const buildControllerSlots = (
  pad: PadState, layout: FamilyLayout, positions: DevicePositions, glyphOf: GlyphOf,
): ControllerSlotSet => {
  const slots: ControllerSlots = {};
  for (const id of Object.keys(SLOT_POSITIONS) as ControllerSlotId[]) {
    if (!hasSlot(id, positions)) continue;
    const iconId = layout.glyphs[id];
    slots[id] = { ...pad[id], label: layout.labels[id], glyph: iconId === undefined ? undefined : glyphOf(iconId) };
  }

  const extras: ControllerExtra[] = [];
  for (const id of Object.keys(EXTRA_POSITIONS) as ExtraSlotId[]) {
    if (!positions.has(EXTRA_POSITIONS[id])) continue;
    extras.push({ id, label: layout.extras[id] ?? id, pressed: pad[id]?.pressed });
  }
  return { slots, extras };
};

export { buildControllerSlots };
