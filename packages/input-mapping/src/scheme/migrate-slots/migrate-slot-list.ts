/* @layer shared-input @kind logic */
import { inPrefillOrder, isLegacySlotList } from '../prefill-order';
import { renumberSlots, slotName } from '../slot-list';
import { isRecord } from './is-record';
import { oldIdsOf } from './old-ids-of';
import { SlotMigrationError } from './slot-migration-error';
import type { SlotIndex } from '@rotp/game-data';
import type { MigratedSlotList, OldSlot } from './migrate-slots.type';

const migrateSlotList = (raw: unknown): MigratedSlotList => {
  if (raw === undefined || raw === null) return { slots: [], byOldId: new Map() };
  if (!Array.isArray(raw)) throw new SlotMigrationError('the stored slot list is not an array');
  raw.forEach((entry, position) => {
    if (!isRecord(entry)) throw new SlotMigrationError(`slot ${position} is not an object`);
  });
  const byOldId = new Map<string, SlotIndex>();
  const ordered = isLegacySlotList(raw) ? inPrefillOrder(raw as OldSlot[]) : (raw as OldSlot[]);
  const { slots } = renumberSlots(ordered.map((slot, position) => {
    const index = position + 1;
    for (const id of oldIdsOf(slot)) if (!byOldId.has(id)) byOldId.set(id, index);
    return {
      index,
      binding: (slot.binding ?? { type: 'none' }),
      ...(slot.position ? { position: slot.position } : {}),
      label: typeof slot.label === 'string' && slot.label ? slot.label : slotName(index),
      ...(slot.icon ? { icon: slot.icon } : {}),
    };
  }));
  return { slots, byOldId };
};

export { migrateSlotList };
