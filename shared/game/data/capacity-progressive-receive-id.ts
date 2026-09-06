/* @layer shared-game @kind logic */
/**
 * Virtual receive ids of the progressive capacity items: the TS half of the
 * contract in core/game-hooks/capacity_progressive.c. One id per family,
 * ABOVE the wallet slots, so a progressive copy rides every override table
 * and the receipt export unresolved and the core climbs to the NEXT planned
 * rung from the save bytes at the last moment before the receive flow:
 *
 *   0x77  explosives     0x78  projectiles
 *   0x79  meter          0x7A  wallet
 *
 * The jump such an id performs is not a property of the id: it is the plan
 * entry the family's reached rung points at (capacity-session.ts arms the
 * plan per session).
 */
import { CAPACITY_FAMILY_IDS } from './capacity-upgrade-names.data';
import { progressiveCapacityFamilyOf, progressiveCapacityItemName } from './capacity-progressive-item';
import type { CapacityFamilyId } from './capacity-family.type';

const PROGRESSIVE_CAPACITY_VIRT_FIRST = 0x77;
const PROGRESSIVE_CAPACITY_VIRT_LAST = PROGRESSIVE_CAPACITY_VIRT_FIRST + CAPACITY_FAMILY_IDS.length - 1;

const isProgressiveCapacityReceiveId = (id: number): boolean =>
  Number.isInteger(id) && id >= PROGRESSIVE_CAPACITY_VIRT_FIRST && id <= PROGRESSIVE_CAPACITY_VIRT_LAST;

/** The family's progressive id, in the core's family order (explosives, projectiles, meter, wallet). */
const progressiveCapacityReceiveIdOf = (family: CapacityFamilyId): number =>
  PROGRESSIVE_CAPACITY_VIRT_FIRST + CAPACITY_FAMILY_IDS.indexOf(family);

const progressiveCapacityFamilyOfReceiveId = (id: number): CapacityFamilyId | undefined =>
  (isProgressiveCapacityReceiveId(id) ? CAPACITY_FAMILY_IDS[id - PROGRESSIVE_CAPACITY_VIRT_FIRST] : undefined);

/** Pool-item name → progressive id; undefined for any other name. */
const progressiveCapacityReceiveIdOfName = (standardItemName: string): number | undefined => {
  const family = progressiveCapacityFamilyOf(standardItemName);
  return family === undefined ? undefined : progressiveCapacityReceiveIdOf(family);
};

/** Progressive id → pool-item name; undefined for any other id. */
const progressiveCapacityItemNameOfReceiveId = (id: number): string | undefined => {
  const family = progressiveCapacityFamilyOfReceiveId(id);
  return family === undefined ? undefined : progressiveCapacityItemName(family);
};

export {
  PROGRESSIVE_CAPACITY_VIRT_FIRST,
  PROGRESSIVE_CAPACITY_VIRT_LAST,
  isProgressiveCapacityReceiveId,
  progressiveCapacityFamilyOfReceiveId,
  progressiveCapacityItemNameOfReceiveId,
  progressiveCapacityReceiveIdOf,
  progressiveCapacityReceiveIdOfName,
};
