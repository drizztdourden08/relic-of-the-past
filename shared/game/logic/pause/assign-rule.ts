/* @layer shared-game @kind logic */
/**
 * What a slot press MEANS, decided once for every way of making one.
 *
 * A pad press arrives through the input router and a mouse click arrives from
 * the pause menu's own overlay, and the two must do the same thing. They used to
 * disagree: one refused an unowned item silently and left a duplicate standing,
 * the other said so out loud and cleared the duplicate. Neither half was wrong
 * about the rule; there were just two copies of it.
 *
 * So the rule lives here, as a plan the caller performs:
 *
 *  - **Nothing under the cursor is not a press.** The gear screen's guard,
 *    armour and passive rows have nothing a button could fire.
 *  - **An unowned cell refuses, and says so.** The grid draws every cell whether
 *    the save holds it or not, so a player WILL press a button on a silhouette.
 *    Doing nothing at all reads as a broken menu; a refusal reads as an answer.
 *  - **One meaning, one button.** Assigning anything a different slot already
 *    holds clears that other slot. Two buttons firing the same thing is not a
 *    feature, it is a button the player has lost without being told.
 *
 * That last rule used to apply to ITEMS only, on the argument that two buttons
 * which both swing the blade are only two ways to swing it. They are not, and
 * the same sentence disproves it: the second button does nothing the first did
 * not already do, and the cost of holding it is every OTHER thing that button
 * could have been carrying. That is exactly the loss the item rule exists to
 * prevent, and the blade is no different for being a verb instead of a thing.
 *
 * The reach verb goes the same way, for the same reason and for one more: the
 * two gameplay verbs sit on two rows of one screen and are assigned by the same
 * press, so a rule that held for one and not the other would be a difference
 * the player could only find by trying it. Every assignment is exclusive; the
 * kind of thing being assigned does not enter into it.
 */
import { assignTargetAt } from './pause-machine';
import type { AssignTarget, PauseContext, PauseState } from './pause-machine';
import type { SlotAssignment, SlotIndex } from '@shared/types/controls/scheme';

type AssignPlan =
  /** The cursor is on nothing assignable. The press is not an error, just nothing. */
  | { outcome: 'ignored' }
  /** The save does not hold what the cursor is on. */
  | { outcome: 'refused' }
  /** Write `target` to the pressed slot, after clearing every slot NUMBER in `clear`. */
  | { outcome: 'assign'; target: AssignTarget; clear: readonly SlotIndex[] };

/**
 * Whether a slot already carries what is about to be assigned. Two items match
 * only when they are the same item; the two verbs have nothing to compare, so
 * matching kinds is the whole test.
 */
const sameTarget = (assignment: SlotAssignment | undefined, target: AssignTarget): boolean => {
  if (!assignment || assignment.kind !== target.kind) return false;
  if (assignment.kind === 'item' && target.kind === 'item') return assignment.hudItem === target.hudItem;
  return true;
};

const planAssignment = (
  state: PauseState,
  ctx: PauseContext,
  slot: SlotIndex,
  assignments: Readonly<Record<SlotIndex, SlotAssignment>>,
): AssignPlan => {
  const target = assignTargetAt(state, ctx);
  if (!target) return { outcome: 'ignored' };
  if (target.kind === 'item' && !ctx.owned[target.hudItem - 1]) return { outcome: 'refused' };
  const clear = Object.keys(assignments)
    .map(Number)
    .filter((index) => index !== slot && sameTarget(assignments[index], target));
  return { outcome: 'assign', target, clear };
};

export { planAssignment };
export type { AssignPlan };
