/* @layer shared-input @kind logic */
/**
 * Reading a profile written before slots were numbers.
 *
 * On disk, a pre-§19 profile carries slots identified by their SDL position
 * (`slot:NORTH`, `slot:DPAD_UP`, `slot:kb:KeyF`) and an assignment table keyed
 * by those strings. Numbers replace both. This turns one into the other, once,
 * on read.
 *
 * A PRE-NUMBER LIST IS SORTED INTO THE CANONICAL ORDER FIRST, and that is the
 * one thing this file does that is not a rename. Such a list was written by the
 * old derivation, in the DEVICE's order (SDL reports SOUTH, EAST, WEST, NORTH),
 * so numbering it as it lay made slot 1 the south button while every shipped
 * document draws slot 1 on the north arm. The result was the right shape with
 * the letters permuted. A device-ordered list was never something the player
 * arranged, so `inPrefillOrder` (the SAME order the prefill imposes, and the
 * only place it is written down) loses nothing of theirs and puts NORTH back on
 * slot 1. Every assignment follows its own slot to whatever number that slot
 * lands on, matched by identity, not by position or by label.
 *
 * A LIST THAT ALREADY CARRIES NUMBERS IS THE PLAYER'S AND IS NEVER RE-SORTED.
 * That is what `isLegacySlotList` tests, and it is what keeps this idempotent:
 * once migrated, a list they have since reordered reads back exactly as written.
 *
 * AN ASSIGNMENT WHOSE SLOT IS NOT IN THE LIST IS RECOVERED, NOT DROPPED.
 * Contract §15 narrowed the assignable set to the face buttons and the d-pad
 * and left every assignment on a shoulder, trigger, paddle or stick click
 * stored-but-inert, so present on disk and absent from every list. §19 removes that
 * cap, so those controls can hold a slot again: each orphaned assignment gets a
 * slot appended for it, rebuilt from the id it was stored under (`slot:NORTH`
 * is position NORTH, `slot:kb:KeyF` is the F key). A player who set up eight
 * buttons and then watched four of them stop working gets all eight back.
 *
 * WHAT FAILS LOUDLY. A stored shape this cannot read (a slot list that is not
 * an array, an entry that is not an object, an assignment table that is not
 * one, an assignment key that is neither a number nor a recognisable old id)
 * throws `SlotMigrationError` instead of returning a partial table. Silently dropping assignments is the one outcome the player
 * cannot detect and cannot undo; a refusal with the offending value in the
 * message is something they can be told about.
 */
import { inPrefillOrder, isLegacySlotList } from './prefill-order';
import { renumberSlots, slotName } from './slot-list';
import type { InputBinding } from '../../types/controls/bindings';
import type { ModernSlot, SlotAssignment, SlotIndex } from '../../types/controls/scheme';

const SLOT_PREFIX = 'slot:';
const KEYBOARD_PREFIX = 'slot:kb:';

/** Thrown when stored data cannot be turned into numbered slots. Never caught
 *  here: the caller decides whether that is a bad file or a bad build. */
class SlotMigrationError extends Error {
  constructor(message: string) {
    super(`[controls] cannot migrate stored slots: ${message}`);
    this.name = 'SlotMigrationError';
  }
}

type OldSlot = Partial<ModernSlot> & { id?: unknown };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Every old id one slot could have been stored under.
 *
 * The id it actually carries, when it still has one, plus the ids its POSITION
 * and its keyboard code would have produced, which is what lets this run on a
 * list whose ids have already been stripped. That matters because the slot list
 * and the assignment table live in two different files: the list is migrated
 * when the profile is read, the table when the settings are, and the second
 * would have nothing left to match against if the first had thrown the ids
 * away. Reconstructing them makes `migrateScheme` idempotent and order-free.
 */
const oldIdsOf = (slot: OldSlot): string[] => {
  const ids: string[] = [];
  if (typeof slot.id === 'string' && slot.id.length > 0) ids.push(slot.id);
  if (slot.position) ids.push(`${SLOT_PREFIX}${slot.position}`);
  if (slot.binding?.type === 'keyboard') ids.push(`${KEYBOARD_PREFIX}${slot.binding.code}`);
  return ids;
};

/** A slot rebuilt from nothing but its old id. This is the recovery path for an
 *  assignment §15 left stranded on a control no list still carried. */
const slotFromOldId = (id: string, index: SlotIndex): ModernSlot => {
  if (id.startsWith(KEYBOARD_PREFIX)) {
    const code = id.slice(KEYBOARD_PREFIX.length);
    const binding: InputBinding = { type: 'keyboard', code };
    return { index, binding, label: code };
  }
  if (id.startsWith(SLOT_PREFIX)) {
    const position = id.slice(SLOT_PREFIX.length);
    return {
      index,
      binding: { type: 'none' },
      position: position as ModernSlot['position'],
      label: position.replace(/_/g, ' '),
    };
  }
  throw new SlotMigrationError(`assignment key "${id}" is neither a slot number nor a stored slot id`);
};

interface MigratedScheme {
  slots: ModernSlot[];
  assignments: Record<SlotIndex, SlotAssignment>;
}

/** The stored list as numbered slots, plus old id → number for the assignments. */
const migrateSlotList = (raw: unknown): { slots: ModernSlot[]; byOldId: Map<string, SlotIndex> } => {
  if (raw === undefined || raw === null) return { slots: [], byOldId: new Map() };
  if (!Array.isArray(raw)) throw new SlotMigrationError('the stored slot list is not an array');
  raw.forEach((entry, position) => {
    if (!isRecord(entry)) throw new SlotMigrationError(`slot ${position} is not an object`);
  });
  const byOldId = new Map<string, SlotIndex>();
  const ordered = isLegacySlotList(raw) ? inPrefillOrder(raw as OldSlot[]) : (raw as OldSlot[]);
  const { slots } = renumberSlots(ordered.map((slot, position) => {
    const index = position + 1;
    // First slot to claim an id keeps it: the list's own order is the rule.
    for (const id of oldIdsOf(slot)) if (!byOldId.has(id)) byOldId.set(id, index);
    return {
      index,
      binding: (slot.binding ?? { type: 'none' }) as InputBinding,
      ...(slot.position ? { position: slot.position } : {}),
      label: typeof slot.label === 'string' && slot.label ? slot.label : slotName(index),
      ...(slot.icon ? { icon: slot.icon } : {}),
    };
  }));
  return { slots, byOldId };
};

/**
 * The assignment table, re-keyed to numbers. Already-numeric keys pass through,
 * so this is idempotent and safe to run on every read.
 */
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
      // Stranded by §15's cap: give it back the slot it used to have.
      const recovered = slotFromOldId(key, slots.length + 1);
      slots.push(recovered);
      byOldId.set(key, recovered.index);
      assignments[recovered.index] = assignment as SlotAssignment;
    }
  }
  return { slots, assignments };
};

export { SlotMigrationError, migrateScheme, migrateSlotList };
export type { MigratedScheme };
