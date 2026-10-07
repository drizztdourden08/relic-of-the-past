/* @layer bridge-wasm @kind logic */
/**
 * Wish pond plan: JS-side arming for the two item-throwing waters
 * (core/game-hooks/wish_pond_plan.c). One row per numbered rung, keyed by the
 * water it belongs to, and two host lines per water: the one she says when
 * she rises, and the one a spent water shows. A planned visit hands over the
 * next rung with no throw and no question, so neither line may be a native
 * one: -1 shows no line at all.
 * Same contract as the other override bridges: every write only records, the
 * gate bit is requested alongside it, and it stays open only while a plan is
 * armed. The session layer composes the rows; this file is the ccall surface
 * only.
 */

import { isGrantableReceiveId } from '@shared/game/data';
import { log } from '../log-bus';
import { getModule } from './wasm-bridge';
import { setWishPondPlanActive } from './item-power';

/** One numbered rung of one item-throwing water, as the core reads it. */
interface WishPondRungArm {
  /** Which water: 0 the light world's, 1 the dark world's (wish_pond_plan.c counts them so). */
  pond: number;
  /** Its place in that water's sequence, from zero. */
  rung: number;
  newItem: number;
  /** Pre-rendered line shown with the grant, or -1 for none. */
  messageId: number;
  /** Id the host is told fired, or -1 to leave the report to the receive-seam table. */
  fireId: number;
  /**
   * True when newItem is the placed item itself: the core resolves it, arms the line on the
   * receipt and keeps the receive-seam table off it. False for a slot's vanilla id, which the
   * table substitutes.
   */
  assigned: boolean;
}

/** The two host lines of one water, as the core reads them. */
interface WishPondLinesArm {
  pond: number;
  /** The line she says when she rises, or -1 for none. */
  awardMessageId: number;
  /** The line a spent water shows, or -1 for none. */
  closedMessageId: number;
}

/**
 * Arm both waters' rungs in one pass. The clear comes first because the core
 * empties BOTH tables at once, so one call has to carry every rung of both.
 * The gate goes up with the record-only writes, so it has latched into WRAM
 * (SyncGateWords, next frame) by the time a handler reads a rung; an empty
 * list leaves both waters on their native branches.
 */
const setWishPondRungs = (rungs: readonly WishPondRungArm[]): void => {
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setWishPondRungs called with no active module');
    return;
  }
  const grantable = rungs.filter((arm) => {
    if (isGrantableReceiveId(arm.newItem)) return true;
    log.error(`[Randomizer] Wish pond rung refused: item 0x${arm.newItem.toString(16)} `
      + `is outside the grantable id range (pond ${arm.pond}, rung ${arm.rung})`);
    return false;
  });
  mod.ccall('WasmClearWishPondPlan', null, [], []);
  setWishPondPlanActive(grantable.length > 0);
  grantable.forEach((arm) => {
    mod.ccall('WasmArmWishPondPlan', null, ['number', 'number', 'number', 'number', 'number', 'number'],
      [arm.pond, arm.rung, arm.newItem, arm.messageId, arm.fireId, arm.assigned ? 1 : 0]);
  });
  log.randomizer(`[Randomizer] Wish pond plan set: ${grantable.length} rungs`);
};

/** The two host lines of one water. Arm after the rungs: their clear resets both lines to none. */
const setWishPondLines = (arm: WishPondLinesArm): void => {
  const { pond, awardMessageId, closedMessageId } = arm;
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setWishPondLines called with no active module');
    return;
  }
  mod.ccall('WasmSetWishPondLines', null, ['number', 'number', 'number'], [pond, awardMessageId, closedMessageId]);
  log.randomizer(`[Randomizer] Wish pond ${pond} lines -> award msg ${awardMessageId}, closing msg ${closedMessageId}`);
};

/** Rungs taken at one water on the live file: what the probes and the tracker read back. */
const wishPondThrowsTaken = (pond: number): number => {
  const mod = getModule();
  return mod ? (mod.ccall('WasmWishPondThrowsTaken', 'number', ['number'], [pond]) as number) : 0;
};

const clearWishPondPlan = (): void => {
  const mod = getModule();
  if (!mod) return;
  // Empty both tables, then close the gate, the same double lock as the rupee pond.
  mod.ccall('WasmClearWishPondPlan', null, [], []);
  setWishPondPlanActive(false);
  log.randomizer('[Randomizer] Wish pond plan cleared');
};

export { clearWishPondPlan, setWishPondLines, setWishPondRungs, wishPondThrowsTaken };
export type { WishPondLinesArm, WishPondRungArm };
