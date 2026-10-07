/* @layer shared-input @kind logic */
/**
 * The slot list, as a list: add, remove, renumber, and what a number move
 * means for the assignments keyed by it.
 *
 * A slot is a NUMBER (see `shared/types/controls/scheme.ts`). The list is
 * ORDERED and OPEN-ENDED, the player builds it, and nothing here consults the
 * device: a thirty-button pad is thirty slots because the player added thirty,
 * and a keyboard is as many as they care to type. That is the whole reason this
 * file exists. The old list was a category-filtered projection of the live
 * device and therefore could never be longer than the eight controls the filter
 * allowed.
 *
 * AN EMPTY SLOT IS A SLOT. Clearing a binding leaves the slot in the list with
 * its number intact; only `removeSlot` takes one out. An empty numbered slot is
 * how a player sees there is a free button to fill, and it is why nothing here
 * garbage-collects one.
 *
 * REMOVING CLOSES THE GAP, and every edit therefore reports a RENUMBER MAP.
 * Numbers are contiguous, so dropping slot 2 makes the old slot 3 the new slot
 * 2. The assignment table is keyed by number, so it has to move with it or
 * every item below the gap silently re-points one button up. `remapAssignments`
 * is that move, and it is why an edit returns a map, not just a list: a
 * caller cannot forget to apply it without the types noticing.
 */
import type { InputBinding } from '../../types/controls/bindings';
import type { ModernSlot, SlotAssignment, SlotIndex } from '../../types/controls/scheme';

/** The first slot a list ever has. Numbers are 1-based, not 0-based, because
 *  they are shown to the player as "Slot 1". */
const FIRST_SLOT = 1;

/** Nothing bound yet. A freshly added slot starts in this state. */
const UNBOUND: InputBinding = { type: 'none' };

/**
 * One edit of the list, and what it did to the numbering.
 *
 * `renumber` maps every OLD number that survives to its new one. A number that
 * is absent from the map was removed, and whatever was assigned to it goes with
 * it. That is deliberate, because the player just deleted that button.
 */
interface SlotListEdit {
  slots: ModernSlot[];
  renumber: ReadonlyMap<SlotIndex, SlotIndex>;
}

/** The player-facing name of a slot. One place, so the controls screen, the
 *  layout editor and any absent-assignment notice all spell it the same. */
const slotName = (index: SlotIndex): string => `Slot ${index}`;

/** 1..N in list order, with the map from whatever the numbers were before. */
const renumberSlots = (slots: readonly ModernSlot[]): SlotListEdit => {
  const renumber = new Map<SlotIndex, SlotIndex>();
  const next = slots.map((slot, position) => {
    const index = FIRST_SLOT + position;
    renumber.set(slot.index, index);
    return slot.index === index ? slot : { ...slot, index };
  });
  return { slots: next, renumber };
};

/** Move an assignment table through a renumber. An entry whose slot is gone is
 *  dropped with it; everything else keeps what it was carrying. */
const remapAssignments = (
  assignments: Readonly<Record<SlotIndex, SlotAssignment>>,
  renumber: ReadonlyMap<SlotIndex, SlotIndex>,
): Record<SlotIndex, SlotAssignment> => {
  const next: Record<SlotIndex, SlotAssignment> = {};
  for (const [key, assignment] of Object.entries(assignments)) {
    const moved = renumber.get(Number(key));
    if (moved !== undefined) next[moved] = assignment;
  }
  return next;
};

/** What an added slot may say about itself. Everything is optional: "add slot"
 *  from the controls screen supplies nothing at all and gets an empty one. */
interface NewSlot {
  binding?: InputBinding;
  position?: ModernSlot['position'];
  label?: string;
  icon?: ModernSlot['icon'];
}

/** Append one slot. Existing numbers never move, so no assignment moves either. */
const addSlot = (slots: readonly ModernSlot[], seed?: NewSlot): SlotListEdit => {
  const index = slots.length + FIRST_SLOT;
  const slot: ModernSlot = {
    index,
    binding: seed?.binding ?? UNBOUND,
    label: seed?.label ?? slotName(index),
    ...(seed?.position ? { position: seed.position } : {}),
    ...(seed?.icon ? { icon: seed.icon } : {}),
  };
  return renumberSlots([...slots, slot]);
};

/** Drop one slot and close the gap. Everything below it moves up one. */
const removeSlot = (slots: readonly ModernSlot[], index: SlotIndex): SlotListEdit =>
  renumberSlots(slots.filter((slot) => slot.index !== index));

/**
 * Re-bind one slot in place.
 *
 * The number does not move, which is the point of numbering: the item on slot 3
 * and slot 3's place in the HUD both stay exactly where they were while what
 * physically fires it changes underneath. `position` and `icon` move WITH the
 * binding when the caller knows them, and are cleared when it does not, because they
 * are a picture of the control being pressed, so leaving the old pad artwork on
 * a slot that now reads a key would draw a button that does nothing.
 */
const setSlotBinding = (
  slots: readonly ModernSlot[],
  index: SlotIndex,
  binding: InputBinding,
  display?: Pick<NewSlot, 'position' | 'icon' | 'label'>,
): ModernSlot[] => slots.map((slot) => {
  if (slot.index !== index) return slot;
  return {
    index: slot.index,
    binding,
    label: display?.label ?? slot.label,
    ...(display?.position ? { position: display.position } : {}),
    ...(display?.icon ? { icon: display.icon } : {}),
  };
});

export {
  FIRST_SLOT, addSlot, remapAssignments, removeSlot, renumberSlots, setSlotBinding, slotName,
};
export type { NewSlot, SlotListEdit };
