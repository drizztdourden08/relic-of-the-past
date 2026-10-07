/* @layer shared-input @kind logic */
/**
 * Modern strategy: functions in, SNES bitmask out.
 *
 * The console has four gameplay verbs and the host has as many slots as the
 * pad has controls, so the mapping is many-to-few by design:
 *   movement → the direction bits, unchanged
 *   pause    → Start
 *   map      → X (the core's own map button; the modern scheme never uses
 *              the secondary-slot variant, so it is always X)
 *   a slot assigned 'sword'  → B
 *   a slot assigned 'action' → A
 *   a slot assigned 'item'   → Y, plus its hud item id as activeItem
 *
 * The item id is the whole trick: the core has ONE equipped-item register,
 * so the host sets that register to the pressed slot's item and presses Y.
 * Any number of item slots therefore work with no new console buttons.
 *
 * If several item slots are down in the same frame, the FIRST OWNED one in
 * slot order wins. That is a deterministic, explainable rule instead of a
 * last-writer race. The others still contribute nothing; Y is pressed exactly
 * once.
 *
 * AN ITEM THE SAVE DOES NOT HOLD IS INERT. Assignments are per-profile and
 * per-save-file assignments are not a thing (see the plan's R2), so a fresh
 * file inherits buttons pointing at items it has never found. The pause menu
 * already refuses to ASSIGN one; gameplay used to disagree with it and park
 * the core's single equipped-item register on an id the save has no item for.
 * So an unowned assignment contributes nothing at all here (no register write
 * and no Y) instead of pressing Y and firing whatever happened to be
 * equipped, which is a button doing something the player never bound it to.
 * Ownership is asked as a predicate because this file is pure and has no
 * inventory; the caller holds the live save (see frame-router.ts).
 */
import { SNES_BUTTON_BITS } from '../../types/controls/snes';
import type { FunctionMask } from './function-mask';
import type { ModernScheme, SlotAssignment } from '../../types/controls/scheme';
import type { RemapResult } from './remap.type';

const BIT = {
  A: 1 << SNES_BUTTON_BITS.A,
  B: 1 << SNES_BUTTON_BITS.B,
  X: 1 << SNES_BUTTON_BITS.X,
  Y: 1 << SNES_BUTTON_BITS.Y,
  Start: 1 << SNES_BUTTON_BITS.Start,
} as const;

/** Does the live save hold this new-style hud item id? Asked once per pressed item slot. */
type OwnsItem = (hudItem: number) => boolean;

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
      // First owned item slot in slot order wins; later ones are ignored.
      if (activeItem === 0) activeItem = assignment.hudItem;
    }
  }

  return { mask, activeItem };
};

export { remapModern };
export type { OwnsItem };
