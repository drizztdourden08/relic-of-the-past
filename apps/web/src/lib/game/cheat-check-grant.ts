/* @layer bridge-wasm @kind logic */
/**
 * What the cheat console's "From Check" button hands over, and how it hands it over.
 *
 * A check's vanilla contents are the right answer only on a file with no seed. On a randomized
 * file the check holds whatever the seed put there, and granting the vanilla item instead is worse
 * than doing nothing: it clears the check off the tracker while handing the player an item the seed
 * never placed, which puts the run out of logic with no way back short of an old save.
 *
 * So the grant is resolved from the active session's placement, and split in two:
 *
 *   1. the item goes through the receipt delivery (the same path a real randomized pickup takes),
 *      because a placed item is often a VIRTUAL id (a progressive family, a counter upgrade, a
 *      wallet rung, a dungeon-flavoured key) that only a substitution or receipt seam can resolve;
 *   2. the completion is written when that delivery finishes, by cheat-check-mark.ts.
 *
 * Both halves ride ONE queue entry. The completion used to be a second entry so it would land after
 * the item, which worked but read to the player as the console handing over two things; the
 * delivery's own completion callback gives the same ordering with one notification.
 *
 * The location is taken out of the poller's reporting first. The console has already handed the
 * item over, so a poll that saw the flag flip and reported the check would make the session deliver
 * a second copy of it.
 *
 * An online session is refused, never guessed at: it holds no placement here, its items are
 * scouted one at a time, and in a multiworld the item at a location may belong to another player.
 */

import { getItem } from '@shared/game/data';
import { log } from '../log-bus';
import type { CheckRecord } from '@shared/game/data';
import { getSessionState } from './randomizer-client/session-store';
import { standardCheckName } from './randomizer-client/check-names';
import { resolveLocalItemId } from './randomizer-client/item-lookup';
import { suppressLocationReport } from './randomizer-client/location-poller';
import { deliverItem } from './delivery-api';
import { isWritable, markCheckCollected, markPlanOf } from './cheat-check-mark';
import { cheatItemGrantAllowed, cheatTriggerCheck, cheatTriggerNpcCheck } from './cheats';

/** The receive id a check with no resolvable vanilla item falls back to (a heart piece). */
const FALLBACK_VANILLA_ID = 0x17;

type CheckGrantPlan =
  /** No seed: hand over the check's own vanilla contents, exactly as the console always has. */
  | { kind: 'vanilla'; itemLabel: string }
  /** This seed placed an item here: hand over that, through the receipt path. */
  | { kind: 'placed'; itemId: number; itemLabel: string; locationName: string }
  /** Nothing can be handed over, and the reason is shown instead of a wrong item. */
  | { kind: 'blocked'; reason: string };

/** A check's vanilla reward as a native receive id. */
const vanillaItemIdOf = (check: CheckRecord): number => {
  const itemId = check.vanillaItemIds[0];
  return itemId ? getItem(itemId).gameId?.receiveItemId ?? FALLBACK_VANILLA_ID : FALLBACK_VANILLA_ID;
};

/** Display name of a check's vanilla reward, for the row on a seedless file. */
const vanillaItemLabelOf = (check: CheckRecord): string => {
  const itemId = check.vanillaItemIds[0];
  return itemId ? getItem(itemId).randomizerName : 'Piece of Heart';
};

/** Whether the console has a vanilla one-call trigger for this check at all. */
const canGrantVanilla = (check: CheckRecord): boolean => {
  const { roomId, chestIndex, flagType, flagMask, itemId, spriteType, postGfx } = check.gameId;
  if (check.kind === 'npc') {
    return flagType !== undefined && flagMask !== undefined && itemId !== undefined
      && spriteType !== undefined && postGfx !== undefined;
  }
  return roomId !== undefined && chestIndex !== undefined;
};

/** The vanilla grant: one call that writes the flag and hands the item over together. */
const grantVanilla = (check: CheckRecord): void => {
  const { roomId, chestIndex, flagType, flagMask, itemId, spriteType, postGfx } = check.gameId;
  if (check.kind === 'npc') {
    if (flagType !== undefined && flagMask !== undefined && itemId !== undefined
      && spriteType !== undefined && postGfx !== undefined) {
      cheatTriggerNpcCheck(flagType, flagMask, itemId, spriteType, postGfx);
    }
    return;
  }
  if (roomId !== undefined && chestIndex !== undefined) {
    cheatTriggerCheck(roomId, chestIndex, vanillaItemIdOf(check));
  }
};

/**
 * What the Grant button would do for this check right now. Pure: the widget calls it to label and
 * enable the button, and grantFromCheck runs the same plan.
 */
const planCheckGrant = (check: CheckRecord): CheckGrantPlan => {
  const { session, placement } = getSessionState();
  // A seedless file still runs the old one-call trigger, so it answers to what THAT can do, not to
  // the completion writer the randomized path needs.
  if (placement === null) {
    if (session !== null) {
      return {
        kind: 'blocked',
        reason: 'an online session scouts its items one at a time, so what this location holds is '
          + 'not known here. Collect it in game, or ask the server to release it.',
      };
    }
    return canGrantVanilla(check)
      ? { kind: 'vanilla', itemLabel: vanillaItemLabelOf(check) }
      : { kind: 'blocked', reason: 'the console has no vanilla trigger for this check' };
  }
  const markPlan = markPlanOf(check);
  if (!isWritable(markPlan)) {
    return { kind: 'blocked', reason: `it cannot be cleared here, because ${markPlan.refusal}` };
  }
  const locationName = standardCheckName(check.id);
  const itemLabel = placement.nameView[locationName];
  if (itemLabel === undefined) {
    return { kind: 'blocked', reason: 'this seed placed nothing at this location' };
  }
  const itemId = resolveLocalItemId(itemLabel);
  if (itemId === undefined) {
    return { kind: 'blocked', reason: `"${itemLabel}" cannot be handed over directly` };
  }
  return { kind: 'placed', itemId, itemLabel, locationName };
};

/**
 * Runs the plan. The completion rides the delivery's own callback, so it is written only once the
 * core has finished handing the item over: a refused or still-retrying grant leaves the check
 * standing instead of clearing it off the tracker with nothing given.
 *
 * The queue fires that callback for a DROPPED entry too (clear(), on a session stop), which would
 * clear the check with nothing delivered, so the session is compared against the one the grant
 * started under. The suppression is repeated there because a save state loaded in between
 * re-baselines the poller from live memory, which would put the location back in play.
 */
const grantFromCheck = (check: CheckRecord): CheckGrantPlan => {
  const plan = planCheckGrant(check);
  if (plan.kind === 'blocked') return plan;
  if (plan.kind === 'vanilla') {
    grantVanilla(check);
    return plan;
  }
  if (!cheatItemGrantAllowed()) return plan;
  const { itemId, itemLabel, locationName } = plan;
  const { session } = getSessionState();
  suppressLocationReport(locationName);
  deliverItem(itemId, itemLabel, 'cheat', undefined, () => {
    if (getSessionState().session !== session) {
      log.randomizer(`[Cheat] "${locationName}" was delivered but not cleared: the session changed `
        + 'under the grant, so the delivery may have been dropped instead of finishing', 'warn');
      return;
    }
    suppressLocationReport(locationName);
    markCheckCollected(check);
  });
  return plan;
};

export { grantFromCheck, planCheckGrant };
export type { CheckGrantPlan };
