/* @layer bridge-wasm @kind logic */
/**
 * Wish-pond arming for a session, the pure half: the two item-throwing waters'
 * settings and the classified plan in, one rung row per prize location out,
 * in the order each water hands them over. Nothing here touches a module, so
 * a test pins it with a plain counter standing in for the fire-id ledger.
 *
 *   capacity (legacy): no rows. The water keeps its native branch list.
 *   vanilla-cost:      the water's own two fairy slots. Each rung hands over
 *                      that slot's VANILLA receive id with no fire id, so the
 *                      grant crosses the receive seam, where the npc table
 *                      substitutes the placed item, marks the slot's bit and
 *                      reports the check exactly as the vanilla throw would.
 *                      That only pays when the slot's npc entry is armed in
 *                      the same session, so a slot the plan did not classify
 *                      as one refuses the whole water.
 *   custom:            the numbered rungs. Each hands over the placed item's
 *                      own receive id with its receipt line and a fire id from
 *                      the session's ledger, which is what closes the rung.
 *
 * A water arms whole or not at all: the core reads a missing rung as the end
 * of the ladder, so a gap would strand every rung past it.
 */

import { getCheck } from '@shared/game/data';
import { pondProfilesOfStats } from '@shared/randomizer/ap-world/fill/placement-ponds';
import { pondPlanOf } from '@shared/randomizer/ap-world/pond/pond-plan';
import { WISH_POND_WATERS } from './wish-pond-rung-keys';
import type { CheckId } from '@shared/game/data';
import type { ApPlacement } from '@shared/randomizer/ap-world/fill/ap-placement.type';
import type { PondId, PondInstance } from '@shared/randomizer/ap-world/pond/pond-instance.type';
import type { PondMode } from '@shared/randomizer/ap-world/pond/pond-profile.type';
import type { WishPondRungArm } from '../wish-pond-plan';
import type { WishPondMessageIds } from './receipt-text-refresh';
import type { PhysicalPlan, PlanEntry } from './physical-plan.type';

/** What a session hands the translation: the two lookups that belong to the session itself. */
interface WishPondArmContext {
  /** The pre-rendered receipt line of one location, or -1. */
  messageIdOf: (locationName: string) => number;
  /** The completion id for one location, allocated in the session's ledger. */
  fireIdOf: (locationName: string) => number;
  /** The two host lines every planned water speaks. */
  lines: WishPondMessageIds;
}

/** One armed rung, with the names it came from for the log and the harness. */
interface WishPondRungRow extends WishPondRungArm {
  location: string;
  itemName: string;
}

/** One water's share of the session. */
interface WishPondWaterPlan {
  id: PondId;
  label: string;
  pond: number;
  mode: PondMode;
  /** [] for a legacy water, and for one that refused. */
  rungs: readonly WishPondRungRow[];
  /** Why a water with prizes arms nothing, or absent when it armed or had none. */
  refusal?: string;
  /** Its two host lines, armed with its rungs. */
  lines: WishPondMessageIds;
}

interface WishPondSessionPlan {
  waters: readonly WishPondWaterPlan[];
  /** Every rung of both waters, the single call the core takes. */
  rungs: readonly WishPondRungArm[];
}

/** What one location hands over, before it has a place and a fire id. */
interface RungGrant {
  itemName: string;
  newItem: number;
  messageId: number;
  /** False for a vanilla slot, which the receive-seam table substitutes and reports. */
  assigned: boolean;
}

type PendingRung = RungGrant & { pond: number; rung: number; location: string };

const vanillaSlotGrant = (entry: PlanEntry | undefined, location: string): RungGrant | string => {
  if (entry?.planClass !== 'override-npc' || entry.npcOverride === undefined || entry.checkId === undefined) {
    return `"${location}" has no npc override armed, so a vanilla grant there would pay nothing`;
  }
  const { itemId } = getCheck(entry.checkId as CheckId).gameId;
  if (itemId === undefined || itemId !== entry.npcOverride.vanillaItemId) {
    return `"${location}" has no vanilla receive id matching its npc override`;
  }
  return { itemName: entry.itemName, newItem: itemId, messageId: -1, assigned: false };
};

const customGrant = (
  entry: PlanEntry | undefined, location: string, messageIdOf: WishPondArmContext['messageIdOf'],
): RungGrant | string => {
  const target = entry?.scriptedOverride?.target;
  if (entry?.scriptedOverride === undefined || target?.surface !== 'wish-pond') {
    return `"${location}" is not classified as a wish-pond rung`;
  }
  return {
    itemName: entry.itemName, newItem: entry.scriptedOverride.targetLocalId,
    messageId: messageIdOf(location), assigned: true,
  };
};

const waterPlanOf = (
  instance: PondInstance, pond: number, placement: ApPlacement,
  byLocation: ReadonlyMap<string, PlanEntry>, context: WishPondArmContext,
): WishPondWaterPlan => {
  const { messageIdOf, fireIdOf, lines } = context;
  const setting = pondProfilesOfStats(placement.stats)[instance.id];
  const base = { id: instance.id, label: instance.label, pond, mode: setting.mode, lines };
  if (setting.mode === 'capacity') return { ...base, rungs: [] };
  const pending: PendingRung[] = [];
  for (const [rung, location] of pondPlanOf(setting, instance).locations.entries()) {
    const entry = byLocation.get(location);
    const grant = setting.mode === 'vanilla-cost'
      ? vanillaSlotGrant(entry, location)
      : customGrant(entry, location, messageIdOf);
    if (typeof grant === 'string') return { ...base, rungs: [], refusal: grant };
    pending.push({ ...grant, pond, rung, location });
  }
  // Fire ids are allocated only once the whole water is known to arm, so a refused
  // water leaves nothing behind in the ledger.
  const rungs = pending.map((row): WishPondRungRow =>
    ({ ...row, fireId: row.assigned ? fireIdOf(row.location) : -1 }));
  return { ...base, rungs };
};

const wishPondSessionOf = (
  placement: ApPlacement, plan: PhysicalPlan, context: WishPondArmContext,
): WishPondSessionPlan => {
  const byLocation = new Map(plan.entries.map((entry) => [entry.locationName, entry]));
  const waters = WISH_POND_WATERS.map(({ instance, pond }) =>
    waterPlanOf(instance, pond, placement, byLocation, context));
  const rungs = waters.flatMap((water) => water.rungs.map(({ pond, rung, newItem, messageId, fireId, assigned }) =>
    ({ pond, rung, newItem, messageId, fireId, assigned })));
  return { waters, rungs };
};

export { wishPondSessionOf };
export type { WishPondArmContext, WishPondRungRow, WishPondSessionPlan, WishPondWaterPlan };
