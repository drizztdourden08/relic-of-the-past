/* @layer renderer-components @kind constants */
/**
 * A plausible save, for arranging a HUD against when no game is running.
 *
 * The editor is reached from the settings screen, which is exactly where a
 * player is least likely to have the game up. Rendering the real elements
 * against an empty save would draw no hearts, an empty meter, three zeroes and
 * no chips. That shell says nothing about whether the layout works. So the
 * elements get something to draw: a partly-hurt life bar wide enough to wrap to
 * a second row, half a magic meter, counts with two and three digits, a
 * four-figure rupee count, and a pad with six controls, four of them holding
 * something. Every one of those is a size question the player is here to
 * answer.
 *
 * The UI labels this as sample data. It is never written anywhere.
 */
import type { ModernSlot, SlotAssignment, SlotIndex } from '@shared/types/controls/scheme';

/** Health is stored in eighths of a heart: 14 of 20 containers. */
const SAMPLE_HEALTH_CAPACITY = 20 * 8;
const SAMPLE_HEALTH_CURRENT = 14 * 8;
/** Magic runs 0..128. */
const SAMPLE_MAGIC = 64;

const SAMPLE_HUD = {
  healthCurrent: SAMPLE_HEALTH_CURRENT,
  healthCapacity: SAMPLE_HEALTH_CAPACITY,
  magicPower: SAMPLE_MAGIC,
  halfMagic: false,
  bombs: 7,
  maxBombs: 10,
  arrows: 22,
  maxArrows: 30,
  keys: 3,
  rupees: 486,
  maxRupees: 999,
};

/** A countdown caught part way, always: the editor is where a countdown node is
 *  placed, and a real one runs for thirty seconds at most, so a stage that only
 *  drew it while the game counted would almost never show it. Eighteen of the
 *  digging game's thirty seconds, so the pie reads part eaten and two digits
 *  sit on it. Never written anywhere. */
const SAMPLE_COUNTDOWN = { total: 30, remaining: 18, fractionLeft: 0.6, frames: 40 };

/** Inventory tiers by save slot. Almost everything is owned, because the sample
 *  slots deal a RANDOM item onto every placeholder and a silhouette says
 *  nothing about the density the layout has to hold. Two cells are left empty
 *  on purpose, so the dimmed state is visible somewhere on the stage. */
const SAMPLE_ITEMS: readonly number[] = [3, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1];
const SAMPLE_BOTTLES: readonly number[] = [2, 2, 0, 0];
const SAMPLE_SWORD_TIER = 2;

const slot = (index: SlotIndex, position: string, label: string): ModernSlot => ({
  index,
  binding: { type: 'none' },
  position: position as ModernSlot['position'],
  label,
  icon: null,
});

/**
 * Eight numbered sample slots, drawn as the face group and the d-pad.
 *
 * A slot list is open-ended now (contract §19), so eight is a plausible SHAPE
 * and not a ceiling: it is the widest the cluster's two crosses get side by
 * side, which is the case a layout most needs to be judged at. Their positions
 * are display only, and the sample binds none of them, because the preview is about
 * size, not about what fires.
 */
const SAMPLE_SLOTS: readonly ModernSlot[] = [
  slot(1, 'NORTH', 'North'),
  slot(2, 'WEST', 'West'),
  slot(3, 'EAST', 'East'),
  slot(4, 'SOUTH', 'South'),
  slot(5, 'DPAD_UP', 'Up'),
  slot(6, 'DPAD_LEFT', 'Left'),
  slot(7, 'DPAD_RIGHT', 'Right'),
  slot(8, 'DPAD_DOWN', 'Down'),
];

/** Hud item ids are the core's new-style ids; these are the first few
 *  inventory cells, which the sample inventory owns. */
const SAMPLE_ASSIGNMENTS: Readonly<Record<SlotIndex, SlotAssignment>> = {
  2: { kind: 'sword' },
  4: { kind: 'action' },
  1: { kind: 'item', hudItem: 3 },
  3: { kind: 'item', hudItem: 4 },
  5: { kind: 'item', hudItem: 1 },
  6: { kind: 'none' },
};

/** The roles above, in reading order, for dealing onto a pad the sample does not know. */
const SAMPLE_ROLES: readonly SlotAssignment[] = Object.values(SAMPLE_ASSIGNMENTS);

/**
 * The hud-item ids a placeholder may be dealt. All 24 are legal; these are the
 * ones whose art is distinctive enough that a row of them reads as a row of
 * different things instead of a repeated shape.
 */
const SAMPLE_ITEM_POOL: readonly number[] = [1, 2, 3, 4, 5, 6, 8, 9, 11, 13, 15, 17, 18, 21];

/**
 * A RANDOM ITEM ON EVERY SLOT, so density can be judged.
 *
 * The maintainer asked for exactly this: "we display a bunch of object sprites
 * at random in these placeholders just for easier layout editing". A cluster of
 * empty discs says nothing about whether a sprite fits between two arms, and
 * whether it fits is the question the editor exists to answer.
 *
 * Deterministic per slot NUMBER instead of actually random, because a
 * placeholder that changed its picture on every keystroke would be unusable,
 * and because two people looking at the same layout should be looking at the
 * same picture. It is sample content and the stage says so out loud; nothing
 * here is written anywhere, and it never touches the player's own assignments.
 */
const sampleSlotAssignments = (
  slots: readonly ModernSlot[],
): Readonly<Record<SlotIndex, SlotAssignment>> => Object.fromEntries(slots.map((slot, order) => {
  // Two fixed roles first: a layout has to be judged with the sword and the
  // contextual action on it, and neither of those wears an item sprite.
  if (order === 1) return [slot.index, { kind: 'sword' } as SlotAssignment];
  if (order === 3) return [slot.index, { kind: 'action' } as SlotAssignment];
  const at = (slot.index * 7 + 3) % SAMPLE_ITEM_POOL.length;
  return [slot.index, { kind: 'item', hudItem: SAMPLE_ITEM_POOL[at] } as SlotAssignment];
}));

export {
  SAMPLE_ASSIGNMENTS,
  SAMPLE_BOTTLES,
  SAMPLE_COUNTDOWN,
  SAMPLE_HUD,
  SAMPLE_ITEMS,
  SAMPLE_ITEM_POOL,
  SAMPLE_SLOTS,
  SAMPLE_SWORD_TIER,
  sampleSlotAssignments,
};
