/* @layer bridge-wasm @kind logic */
/**
 * The placement→game bridge. Classifies every planned location of an
 * Placement (only the event slots are excluded, because they are logic
 * constructs, not item spots) into the physical plan classes: chest-kind checks with a
 * resolvable item become in-core chest overrides; standing world items with
 * a certified pickup seam become in-core standing overrides (the pickup
 * shows and grants the assigned item natively); checks whose grant crosses
 * the plain receive seam with a usable key (npc gifts, boss prizes, the
 * receive-crossing world items) become in-core npc overrides; key drops
 * become in-core drop overrides; the boss-prize slots have no seam at all
 * and are reported as locked vanilla, not dropped. Physical classes report completion from
 * the substitution seam itself (override-fired events), so they need no
 * polled detection. Remaining detectable checks are delivered on their flag
 * flip, and generation-locked locations need no action because the game
 * already gives vanilla, they are still polled and reported. Anything else
 * is a hard plan error the session must refuse on.
 */

import type { ItemKey } from '@shared/randomizer/world/item-ids.data';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import { getCheck } from '@shared/game/data';
import { EVENT_LOCATIONS, PRIZE_LOCATIONS } from '@shared/randomizer/world/scope-tables';
import { checkIdOfLocation } from '@shared/randomizer/world/location-record';
import { detectionOf, withProgressBaseline } from './check-detection';
import { freestandingKeyDropOf } from './freestanding-key-drops';
import { isBigKeyDrop } from './key-drop-size';
import { npcOverrideKeyOf } from './npc-override-key';
import { scriptedOverrideKeyOf } from './scripted-override-key';
import { standingOverrideKeyOf } from './standing-override-key';
import { shopOverrideKeyOf } from './shop-override-key';
import { pondPrizeTargetOf } from './pond-prize-target';
import { capabilityVanillaItemOf, isLockedVanilla } from './scope-lock';
import { scopeFlagsOfStats } from './plan-scope-flags';
import { planItemLabel, targetLocalIdOf } from './plan-target-id';
import type { CheckId } from '@shared/game/data';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { ScopeFlags } from './scope-lock';
import type { PhysicalPlan, PlanEntry, PlanError } from './physical-plan.type';

const npcGrantOf = (checkId: string): PlanEntry['npcGrant'] => {
  const { flagType, flagMask, spriteType, postGfx } = getCheck(checkId as CheckId).gameId;
  if (flagType === undefined || spriteType === undefined) return undefined;
  return { flagType, flagMask: flagMask ?? 0, spriteType, postGfx: postGfx ?? 0 };
};

/** Classify one (location, assigned item) pair. */
const classifyLocation = (
  location: LocationKey, item: ItemKey, flags: ScopeFlags,
): PlanEntry | PlanError => {
  // The record the location stands for: none for a restock or a pond rung.
  const checkId = checkIdOfLocation(location);
  const detection = checkId !== undefined
    ? withProgressBaseline(detectionOf(checkId), flags.capacityStartTiers?.get(location))
    : null;
  const detectionField = detection !== null ? { detection } : {};

  if (isLockedVanilla(location, flags)) {
    // A locked location must hold its vanilla item, so a shuffled item there
    // means the placement predates the lock (a stale seed the game cannot
    // honor), which stays a hard refusal.
    const requiredVanilla = capabilityVanillaItemOf(location, flags);
    if (requiredVanilla !== undefined && item !== requiredVanilla) {
      const reason = PRIZE_LOCATIONS.has(location)
        ? `this seed placed dungeon prizes, which are no longer shuffled. Recreate the profile (expected "${requiredVanilla}")`
        : 'no certified physical path but a shuffled item is placed here (stale placement, recreate the profile)';
      return { location, item, reason };
    }
    return {
      location, item, planClass: 'vanilla-locked',
      ...(checkId !== undefined ? { checkId } : {}),
      ...detectionField,
    };
  }
  const targetLocalId = targetLocalIdOf(item);
  if (targetLocalId === undefined) {
    return { location, item, reason: `assigned item is unresolvable: ${planItemLabel(item)}` };
  }
  // A shelf slot is keyed off the shop dataset, not a check record, because the app
  // has none for a shelf, because a shelf is a repeatable purchase in the
  // unmodified game instead of a one-off check. It reports from its own
  // substitution seam, so it needs no polled detection either.
  const shopKey = shopOverrideKeyOf(location, flags.shops, flags.shopPrices);
  if (shopKey !== null) {
    return {
      location, item, planClass: 'override-shop', ...detectionField,
      shopOverride: { ...shopKey, targetLocalId },
    };
  }
  // A pond prize slot under a non-legacy pond, keyed by its place in that pond's
  // own table (pond-prize-target.ts). Still the scripted-grant plan class, so
  // completion reports from the substitution seam exactly as every other pond
  // grant does, and no polled detection is needed.
  const pondTarget = pondPrizeTargetOf(location, flags);
  if (pondTarget !== null) {
    return {
      location, item, planClass: 'override-scripted',
      ...(checkId !== undefined ? { checkId } : {}),
      scriptedOverride: { target: pondTarget, targetLocalId },
    };
  }
  if (checkId === undefined) {
    return { location, item, reason: 'no check record for this location' };
  }
  const { kind, gameId } = getCheck(checkId as CheckId);
  if (kind === 'chest' && gameId.roomId !== undefined && gameId.chestIndex !== undefined) {
    if (detection === null) {
      return { location, item, reason: 'check record has no usable detection' };
    }
    return {
      location, item, checkId, planClass: 'override', detection,
      target: { roomId: gameId.roomId, chestIndex: gameId.chestIndex, targetLocalId },
    };
  }
  // The certified scripted-grant surfaces (upgrade pond, cave bat, prize
  // minigame) substitute at their own handler seams, checked before the
  // generic keys, since their records carry no receive-seam key at all.
  const scriptedKey = scriptedOverrideKeyOf(checkId as CheckId);
  if (scriptedKey !== null) {
    return {
      location, item, checkId, planClass: 'override-scripted', ...detectionField,
      scriptedOverride: { target: scriptedKey, targetLocalId },
    };
  }
  // A freestanding placed key crosses the same absorption seam as a released
  // key drop, so it substitutes through the drop table under its room.
  const freestandingKey = freestandingKeyDropOf(checkId as CheckId);
  if (freestandingKey !== null) {
    return {
      location, item, checkId, planClass: 'override-drop', ...detectionField,
      dropOverride: { ...freestandingKey, targetLocalId },
    };
  }
  const standingKey = standingOverrideKeyOf(checkId as CheckId);
  if (standingKey !== null) {
    return {
      location, item, checkId, planClass: 'override-standing', ...detectionField,
      standingOverride: { ...standingKey, targetLocalId },
    };
  }
  const npcKey = npcOverrideKeyOf(checkId as CheckId);
  if (npcKey !== null) {
    return {
      location, item, checkId, planClass: 'override-npc', ...detectionField,
      npcOverride: { ...npcKey, targetLocalId },
    };
  }
  if (kind === 'keyDrop' && gameId.roomId !== undefined) {
    // The drop's vanilla item names its size; the record's roomId pins it.
    const big = isBigKeyDrop(checkId as CheckId);
    return {
      location, item, checkId, planClass: 'override-drop', ...detectionField,
      dropOverride: { roomId: gameId.roomId, big, targetLocalId },
    };
  }
  if (detection === null) {
    return { location, item, reason: 'check record has no usable detection' };
  }
  const npcGrant = npcGrantOf(checkId);
  return {
    location, item, checkId, planClass: 'deliver', detection, targetLocalId,
    ...(npcGrant !== undefined ? { npcGrant } : {}),
  };
};

const isPlanError = (row: PlanEntry | PlanError): row is PlanError =>
  (row as PlanError).reason !== undefined;

const buildPhysicalPlan = (placement: Placement): PhysicalPlan => {
  // The persisted stats say what generation locked; the same derivation names the rows.
  const flags = { ...scopeFlagsOfStats(placement.stats), shopPrices: placement.shopPrices ?? {} };
  const entries: PlanEntry[] = [];
  const errors: PlanError[] = [];
  for (const [where, item] of Object.entries(placement.locations)) {
    const location = where as LocationKey;
    if (EVENT_LOCATIONS.has(location)) continue;
    const row = classifyLocation(location, item, flags);
    if (isPlanError(row)) errors.push(row);
    else entries.push(row);
  }
  const countOf = (planClass: PlanEntry['planClass']): number =>
    entries.filter((entry) => entry.planClass === planClass).length;
  const counts = {
    override: countOf('override'),
    overrideNpc: countOf('override-npc'),
    overrideDrop: countOf('override-drop'),
    overrideStanding: countOf('override-standing'),
    overrideScripted: countOf('override-scripted'),
    overrideShop: countOf('override-shop'),
    deliver: countOf('deliver'),
    vanillaLocked: countOf('vanilla-locked'),
    // Physical override rows report from the substitution seam, so only a
    // LOCKED row without a detection is invisible to the session.
    pollBlind: entries.filter((entry) =>
      entry.planClass === 'vanilla-locked' && entry.detection === undefined).length,
    errors: errors.length,
  };
  return { entries, errors, counts };
};

export { buildPhysicalPlan, classifyLocation };
export type { ScopeFlags };
