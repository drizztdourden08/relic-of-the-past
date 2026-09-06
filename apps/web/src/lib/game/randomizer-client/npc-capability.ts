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
 * The capacity probe runs the same test over the fairy-slot table; its
 * slots carry scripted-grant keys (the pond's own handler seam), like the
 * cave bat and the prize minigame.
 */

import { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS } from '@shared/randomizer/ap-world/scope-vanilla.data';
import { CAPACITY_UPGRADE_LOCATIONS } from '@shared/randomizer/ap-world/special-locations.data';
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

let cachedNpcDeliverable: ReadonlySet<string> | null = null;
let cachedWorldDeliverable: ReadonlySet<string> | null = null;
let cachedCapacityDeliverable: ReadonlySet<string> | null = null;

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

/** The capacity-fairy slots with a certified physical delivery path. */
const probeDeliverableCapacityLocations = (): ReadonlySet<string> => {
  cachedCapacityDeliverable ??= probeTable(CAPACITY_UPGRADE_LOCATIONS);
  return cachedCapacityDeliverable;
};

/** Complement view: the capacity slots generation must keep vanilla. */
const undeliverableCapacityLocations = (): ReadonlySet<string> =>
  lockedComplement(CAPACITY_UPGRADE_LOCATIONS, probeDeliverableCapacityLocations());

export {
  probeDeliverableNpcLocations,
  undeliverableNpcLocations,
  probeDeliverableWorldLocations,
  undeliverableWorldLocations,
  probeDeliverableCapacityLocations,
  undeliverableCapacityLocations,
};
