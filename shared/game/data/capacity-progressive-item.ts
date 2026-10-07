/* @layer shared-game @kind logic */
/**
 * The progressive capacity items: one pool name per family
 * (capacity-upgrade-names.data.ts) whose every pickup climbs to the NEXT rung
 * of the family's planned ladder, in plan order, whatever the shuffle did
 * with the copies. The name carries the family and nothing else, because the jump
 * is decided at grant time from the rung already reached, so this is the
 * only place a progressive name is tied to its family.
 */
import { CAPACITY_FAMILY_IDS, CAPACITY_PROGRESSIVE_NAMES } from './capacity-upgrade-names.data';
import type { CapacityFamilyId } from './capacity-family.type';

const FAMILY_BY_PROGRESSIVE_NAME: ReadonlyMap<string, CapacityFamilyId> = new Map(
  CAPACITY_FAMILY_IDS.map((family): [string, CapacityFamilyId] => [CAPACITY_PROGRESSIVE_NAMES[family], family]),
);

const progressiveCapacityItemName = (family: CapacityFamilyId): string => CAPACITY_PROGRESSIVE_NAMES[family];

const progressiveCapacityFamilyOf = (itemName: string): CapacityFamilyId | undefined =>
  FAMILY_BY_PROGRESSIVE_NAME.get(itemName);

const isProgressiveCapacityItemName = (itemName: string): boolean => FAMILY_BY_PROGRESSIVE_NAME.has(itemName);

export { isProgressiveCapacityItemName, progressiveCapacityFamilyOf, progressiveCapacityItemName };
