/* @layer bridge-wasm @kind logic */
/**
 * Capability probes: decide, per capability-gated location, whether the app
 * can physically play a shuffled item there. A location is serviceable when
 * it resolves to a check record, its nominal vanilla item resolves to a
 * native receive id, and it has EITHER a physical substitution key (npc /
 * standing / drop tables, since those report completion from the substitution
 * seam itself, no flag needed) OR a certified live detection for the
 * deliver path. The resulting sets feed generation (only these locations
 * enter the shuffle) and the bridge (the rest classify vanilla-locked), so
 * a plan error on a probed location is structurally impossible for fresh
 * seeds. Data-driven and stable per build, cached after the first walk.
 * The pond probe runs the same test over every pond's own pair of slots: the
 * capacity pond's two carry scripted-grant keys (its handler's own seam), like
 * the cave bat and the prize minigame, and each wish pond's two carry npc keys
 * (the receive seam, keyed by the water's room). A numbered rung past a pair
 * has no seam of its own, so certifying the pair is what certifies that pond's
 * whole ladder (pond/pond-spots.ts reads a pond's pair out of the set).
 */

import { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS } from '@shared/randomizer/ap-world/scope-vanilla.data';
import { CAPACITY_UPGRADE_LOCATIONS } from '@shared/randomizer/ap-world/special-locations.data';
import { POND_INSTANCES } from '@shared/randomizer/ap-world/pond/pond-instances.data';
import { checkIdByStandardName } from './check-names';
import { detectionOf } from './check-detection';
import { freestandingKeyDropOf } from './freestanding-key-drops';
import { npcOverrideKeyOf } from './npc-override-key';
import { scriptedOverrideKeyOf } from './scripted-override-key';
import { standingOverrideKeyOf } from './standing-override-key';
import { resolveServerItemLocalId } from './online-items';
import type { CheckId } from '@shared/game/data';

/** One physical-delivery test, shared by every capability table. */
const isDeliverable = (locationName: string, vanillaItem: string): boolean => {
  const checkId = checkIdByStandardName(locationName);
  if (checkId === undefined) return false;
  if (resolveServerItemLocalId(vanillaItem) === undefined) return false;
  // A physical substitution key reports completion at the grant seam itself
  // (override-fired events), so it needs no polled detection.
  if (scriptedOverrideKeyOf(checkId as CheckId) !== null) return true;
  if (freestandingKeyDropOf(checkId as CheckId) !== null) return true;
  if (standingOverrideKeyOf(checkId as CheckId) !== null) return true;
  if (npcOverrideKeyOf(checkId as CheckId) !== null) return true;
  return detectionOf(checkId) !== null;
};

const probeTable = (table: ReadonlyMap<string, string>): ReadonlySet<string> => {
  const deliverable = new Set<string>();
  for (const [locationName, vanillaItem] of table) {
    if (isDeliverable(locationName, vanillaItem)) deliverable.add(locationName);
  }
  return deliverable;
};

const lockedComplement = (
  table: ReadonlyMap<string, string>, deliverable: ReadonlySet<string>,
): ReadonlySet<string> => {
  const locked = new Set<string>();
  for (const name of table.keys()) {
    if (!deliverable.has(name)) locked.add(name);
  }
  return locked;
};

/**
 * Every pond's two vanilla slots, each mapped to the grant its fairy makes
 * there in the unmodified game. The capacity pond's pair is named by the
 * upgrade table, the wish ponds' pairs by the npc scope, because that is where
 * each one's vanilla item is written down.
 */
const POND_SLOT_LOCATIONS: ReadonlyMap<string, string> = new Map(
  POND_INSTANCES.flatMap((pond) => pond.slots.flatMap((slot) => {
    const vanillaItem = CAPACITY_UPGRADE_LOCATIONS.get(slot.location)
      ?? NPC_SCOPE_LOCATIONS.get(slot.location);
    return vanillaItem === undefined ? [] : [[slot.location, vanillaItem] as [string, string]];
  })),
);

let cachedNpcDeliverable: ReadonlySet<string> | null = null;
let cachedWorldDeliverable: ReadonlySet<string> | null = null;
let cachedPondDeliverable: ReadonlySet<string> | null = null;

/** The npc-scope AP location names with a certified physical delivery path. */
const probeDeliverableNpcLocations = (): ReadonlySet<string> => {
  cachedNpcDeliverable ??= probeTable(NPC_SCOPE_LOCATIONS);
  return cachedNpcDeliverable;
};

/** Complement view: the npc-scope locations generation must keep vanilla. */
const undeliverableNpcLocations = (): ReadonlySet<string> =>
  lockedComplement(NPC_SCOPE_LOCATIONS, probeDeliverableNpcLocations());

/** The world-item AP location names with a certified physical delivery path. */
const probeDeliverableWorldLocations = (): ReadonlySet<string> => {
  cachedWorldDeliverable ??= probeTable(WORLD_ITEM_SCOPE_LOCATIONS);
  return cachedWorldDeliverable;
};

/** Complement view: the world-item locations generation must keep vanilla. */
const undeliverableWorldLocations = (): ReadonlySet<string> =>
  lockedComplement(WORLD_ITEM_SCOPE_LOCATIONS, probeDeliverableWorldLocations());

/**
 * The pond slots with a certified physical delivery path: the capacity pond's
 * pair and both wish ponds'. Generation carries ONE set for every pond, so all
 * six are certified here; the capacity-only complement below stays over the
 * upgrade table, because that is the only pair a profile locks.
 */
const probeDeliverablePondLocations = (): ReadonlySet<string> => {
  cachedPondDeliverable ??= probeTable(POND_SLOT_LOCATIONS);
  return cachedPondDeliverable;
};

/** Complement view: the capacity slots generation must keep vanilla. */
const undeliverableCapacityLocations = (): ReadonlySet<string> =>
  lockedComplement(CAPACITY_UPGRADE_LOCATIONS, probeDeliverablePondLocations());

export {
  probeDeliverableNpcLocations,
  undeliverableNpcLocations,
  probeDeliverableWorldLocations,
  undeliverableWorldLocations,
  probeDeliverablePondLocations,
  undeliverableCapacityLocations,
};
