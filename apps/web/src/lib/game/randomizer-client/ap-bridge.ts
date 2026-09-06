/* @layer bridge-wasm @kind logic */
/**
 * The placement→game bridge. Classifies every planned location of an
 * ApPlacement (only the event slots are excluded — they are logic
 * constructs, not item spots) into the physical plan classes: chest-kind checks with a
 * resolvable item become in-core chest overrides; standing world items with
 * a certified pickup seam become in-core standing overrides (the pickup
 * shows and grants the assigned item natively); checks whose grant crosses
 * the plain receive seam with a usable key (npc gifts, boss prizes, the
 * receive-crossing world items) become in-core npc overrides; key drops
 * become in-core drop overrides; the boss-prize slots have no seam at all
 * and are reported as locked vanilla rather than dropped. Physical classes report completion from
 * the substitution seam itself (override-fired events), so they need no
 * polled detection. Remaining detectable checks are delivered on their flag
 * flip, and generation-locked locations need no action because the game
 * already gives vanilla — they are still polled and reported. Anything else
 * is a hard plan error the session must refuse on.
 */

import { getCheck } from '@shared/game/data';
import { EVENT_LOCATIONS, KEY_DROP_LOCATIONS, PRIZE_LOCATIONS } from '@shared/randomizer/ap-world/special-locations.data';
import { log } from '../../log-bus';
import { checkIdByStandardName } from './check-names';
import { detectionOf, withProgressBaseline } from './check-detection';
import { freestandingKeyDropOf } from './freestanding-key-drops';
import { npcOverrideKeyOf } from './npc-override-key';
import { scriptedOverrideKeyOf } from './scripted-override-key';
import { standingOverrideKeyOf } from './standing-override-key';
import { shopOverrideKeyOf } from './shop-override-key';
import { capabilityVanillaItemOf, isLockedVanilla } from './scope-lock';
import { scopeFlagsOfStats } from './plan-scope-flags';
import { resolveServerItemLocalId } from './online-items';
import type { CheckId } from '@shared/game/data';
import type { ApPlacement } from '@shared/randomizer/ap-world/fill/ap-placement.type';
import type { ScopeFlags } from './scope-lock';
import type { PhysicalPlan, PlanEntry, PlanError } from './physical-plan.type';

const npcGrantOf = (checkId: string): PlanEntry['npcGrant'] => {
  const { flagType, flagMask, spriteType, postGfx } = getCheck(checkId as CheckId).gameId;
  if (flagType === undefined || spriteType === undefined) return undefined;
  return { flagType, flagMask: flagMask ?? 0, spriteType, postGfx: postGfx ?? 0 };
};

/** Classify one (location, assigned item) pair. */
const classifyLocation = (
  locationName: string, itemName: string, flags: ScopeFlags,
): PlanEntry | PlanError => {
  const checkId = checkIdByStandardName(locationName);
  const detection = checkId !== undefined
    ? withProgressBaseline(detectionOf(checkId), flags.capacityStartTiers?.get(locationName))
    : null;
  const detectionField = detection !== null ? { detection } : {};

  if (isLockedVanilla(locationName, flags)) {
    // A locked location must hold its vanilla item — a shuffled item there
    // means the placement predates the lock (a stale seed the game cannot
    // honor), which stays a hard refusal.
    const requiredVanilla = capabilityVanillaItemOf(locationName, flags);
    if (requiredVanilla !== undefined && itemName !== requiredVanilla) {
      const reason = PRIZE_LOCATIONS.has(locationName)
        ? `this seed placed dungeon prizes, which are no longer shuffled — recreate the profile (expected "${requiredVanilla}")`
        : 'no certified physical path but a shuffled item is placed here (stale placement — recreate the profile)';
      return { locationName, itemName, reason };
    }
    return {
      locationName, itemName, planClass: 'vanilla-locked',
      ...(checkId !== undefined ? { checkId } : {}),
      ...detectionField,
    };
  }
  const targetLocalId = resolveServerItemLocalId(itemName);
  if (targetLocalId === undefined) {
    return { locationName, itemName, reason: `assigned item is unresolvable: ${itemName}` };
  }
  // A shelf slot is keyed off the shop dataset, not a check record — the app
  // has none for a shelf, because a shelf is a repeatable purchase in the
  // unmodified game rather than a one-off check. It reports from its own
  // substitution seam, so it needs no polled detection either.
  const shopKey = shopOverrideKeyOf(locationName, flags.shops, flags.shopPrices);
  if (shopKey !== null) {
    return {
      locationName, itemName, planClass: 'override-shop', ...detectionField,
      shopOverride: { ...shopKey, targetLocalId },
    };
  }
  // A pond prize slot under a non-legacy pond. The pond's plan hands these over
  // in prize ORDER from its own table, so they are keyed by ordinal rather than
  // by a check record — the slots past the reference's two have none. Still the
  // scripted-grant plan class, so completion reports from the substitution seam
  // exactly as every other pond grant does, and no polled detection is needed
  // (the capacity tier a purchase used to advance no longer moves).
  const pondPrize = flags.pondPrizeLocations?.indexOf(locationName) ?? -1;
  if (pondPrize >= 0) {
    return {
      locationName, itemName, planClass: 'override-scripted',
      ...(checkId !== undefined ? { checkId } : {}),
      scriptedOverride: { target: { surface: 'pond', prize: pondPrize }, targetLocalId },
    };
  }
  if (checkId === undefined) {
    return { locationName, itemName, reason: 'no check record for this location' };
  }
  const { kind, gameId } = getCheck(checkId as CheckId);
  if (kind === 'chest' && gameId.roomId !== undefined && gameId.chestIndex !== undefined) {
    if (detection === null) {
      return { locationName, itemName, reason: 'check record has no usable detection (or is review-gated)' };
    }
    return {
      locationName, itemName, checkId, planClass: 'override', detection,
      target: { roomId: gameId.roomId, chestIndex: gameId.chestIndex, targetLocalId },
    };
  }
  // The certified scripted-grant surfaces (upgrade pond, cave bat, prize
  // minigame) substitute at their own handler seams — checked before the
  // generic keys, since their records carry no receive-seam key at all.
  const scriptedKey = scriptedOverrideKeyOf(checkId as CheckId);
  if (scriptedKey !== null) {
    return {
      locationName, itemName, checkId, planClass: 'override-scripted', ...detectionField,
      scriptedOverride: { target: scriptedKey, targetLocalId },
    };
  }
  // A freestanding placed key crosses the same absorption seam as a released
  // key drop, so it substitutes through the drop table under its room.
  const freestandingKey = freestandingKeyDropOf(checkId as CheckId);
  if (freestandingKey !== null) {
    return {
      locationName, itemName, checkId, planClass: 'override-drop', ...detectionField,
      dropOverride: { ...freestandingKey, targetLocalId },
    };
  }
  const standingKey = standingOverrideKeyOf(checkId as CheckId);
  if (standingKey !== null) {
    return {
      locationName, itemName, checkId, planClass: 'override-standing', ...detectionField,
      standingOverride: { ...standingKey, targetLocalId },
    };
  }
  const npcKey = npcOverrideKeyOf(checkId as CheckId);
  if (npcKey !== null) {
    return {
      locationName, itemName, checkId, planClass: 'override-npc', ...detectionField,
      npcOverride: { ...npcKey, targetLocalId },
    };
  }
  if (kind === 'keyDrop' && gameId.roomId !== undefined) {
    // The AP-side vanilla item names the drop's size; the record's roomId pins it.
    const big = KEY_DROP_LOCATIONS.get(locationName)?.startsWith('Big Key') === true;
    return {
      locationName, itemName, checkId, planClass: 'override-drop', ...detectionField,
      dropOverride: { roomId: gameId.roomId, big, targetLocalId },
    };
  }
  if (detection === null) {
    return { locationName, itemName, reason: 'check record has no usable detection (or is review-gated)' };
  }
  const npcGrant = npcGrantOf(checkId);
  return {
    locationName, itemName, checkId, planClass: 'deliver', detection, targetLocalId,
    ...(npcGrant !== undefined ? { npcGrant } : {}),
  };
};

const isPlanError = (row: PlanEntry | PlanError): row is PlanError =>
  (row as PlanError).reason !== undefined;

const buildPhysicalPlan = (placement: ApPlacement): PhysicalPlan => {
  // The persisted stats say what generation locked; the same derivation names the rows.
  const flags = { ...scopeFlagsOfStats(placement.stats), shopPrices: placement.shopPrices ?? {} };
  const entries: PlanEntry[] = [];
  const errors: PlanError[] = [];
  for (const [locationName, itemName] of Object.entries(placement.nameView)) {
    if (EVENT_LOCATIONS.has(locationName)) continue;
    const row = classifyLocation(locationName, itemName, flags);
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
    // LOCKED row without a detection is truly invisible to the session.
    pollBlind: entries.filter((entry) =>
      entry.planClass === 'vanilla-locked' && entry.detection === undefined).length,
    errors: errors.length,
  };
  return { entries, errors, counts };
};

const logPlanSummary = (plan: PhysicalPlan, tag: string): void => {
  const { counts, errors } = plan;
  log.randomizer(`${tag} Plan summary: ${counts.override} overrides, ${counts.overrideNpc} npc overrides, `
    + `${counts.overrideDrop} drop overrides, ${counts.overrideStanding} standing overrides, `
    + `${counts.overrideScripted} scripted overrides, ${counts.overrideShop} shop overrides, `
    + `${counts.deliver} deliver, ${counts.vanillaLocked} vanilla-locked (${counts.pollBlind} poll-blind), `
    + `${counts.errors} errors`);
  for (const error of errors) {
    log.randomizer(`${tag} Plan error at "${error.locationName}" (${error.itemName}): ${error.reason}`, 'error');
  }
};

export { buildPhysicalPlan, classifyLocation, logPlanSummary };
export type { ScopeFlags };
