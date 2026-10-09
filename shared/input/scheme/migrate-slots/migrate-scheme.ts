/* @layer shared-input @kind logic */
import { isRecord } from './is-record';
import { migrateSlotList } from './migrate-slot-list';
import { slotFromOldId } from './slot-from-old-id';
import { SlotMigrationError } from './slot-migration-error';
import type { SlotAssignment, SlotIndex } from '../../../types/controls/scheme';
import type { MigratedScheme } from './migrate-slots.type';

const migrateScheme = (rawSlots: unknown, rawAssignments: unknown): MigratedScheme => {
  const { slots, byOldId } = migrateSlotList(rawSlots);
  const assignments: Record<SlotIndex, SlotAssignment> = {};
  if (rawAssignments !== undefined && rawAssignments !== null) {
    if (!isRecord(rawAssignments)) throw new SlotMigrationError('the stored assignment table is not an object');
    for (const [key, assignment] of Object.entries(rawAssignments)) {
      const numeric = Number(key);
      if (Number.isInteger(numeric) && numeric > 0) {
        assignments[numeric] = assignment as SlotAssignment;
        continue;
      }
      const known = byOldId.get(key);
      if (known !== undefined) {
        assignments[known] = assignment as SlotAssignment;
        continue;
      }
      const recovered = slotFromOldId(key, slots.length + 1);
      slots.push(recovered);
      byOldId.set(key, recovered.index);
      assignments[recovered.index] = assignment as SlotAssignment;
    }
  }
  return { slots, assignments };
};

export { migrateScheme };
