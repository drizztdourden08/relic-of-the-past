/* @layer shared-game @kind logic */
/**
 * Pool item name ⇄ (family, jump) for the capacity upgrades, over the name
 * tables in capacity-upgrade-names.data.ts. A jump is the number of ladder
 * steps one item advances its family by; the name is the only thing the
 * pool, the placement and the receipt export carry, so this is the one
 * place the two are tied together. The progressive names carry a family but
 * no jump (capacity-progressive-item.ts); the family lookup and the
 * is-an-upgrade test cover them, the jump lookup does not.
 */
import { CAPACITY_FAMILY_IDS, CAPACITY_UPGRADE_NAMES } from './capacity-upgrade-names.data';
import { isProgressiveCapacityItemName, progressiveCapacityFamilyOf } from './capacity-progressive-item';
import type { CapacityFamilyId } from './capacity-family.type';

interface CapacityUpgradeItem {
  family: CapacityFamilyId;
  /** Ladder steps this item advances its family by (≥ 1). */
  jump: number;
}

const ITEM_BY_NAME: ReadonlyMap<string, CapacityUpgradeItem> = new Map(
  CAPACITY_FAMILY_IDS.flatMap((family) =>
    CAPACITY_UPGRADE_NAMES[family].map((name, index): [string, CapacityUpgradeItem] =>
      [name, { family, jump: index + 1 }])),
);

/** The largest jump a family's name table (and id space) can carry. */
const maxUpgradeJumpOf = (family: CapacityFamilyId): number => CAPACITY_UPGRADE_NAMES[family].length;

const upgradeItemName = (family: CapacityFamilyId, jump: number): string => {
  const names = CAPACITY_UPGRADE_NAMES[family];
  if (!Number.isInteger(jump) || jump < 1 || jump > names.length) {
    throw new Error(`${family}: no upgrade item carries a jump of ${jump}`);
  }
  return names[jump - 1];
};

const upgradeItemOfName = (itemName: string): CapacityUpgradeItem | undefined => ITEM_BY_NAME.get(itemName);

/** Fixed-jump or progressive: any capacity upgrade the pool can carry. */
const isCapacityUpgradeItemName = (itemName: string): boolean =>
  ITEM_BY_NAME.has(itemName) || isProgressiveCapacityItemName(itemName);

/** The family of any capacity upgrade name, fixed-jump or progressive. */
const capacityFamilyOfItemName = (itemName: string): CapacityFamilyId | undefined =>
  ITEM_BY_NAME.get(itemName)?.family ?? progressiveCapacityFamilyOf(itemName);

export {
  capacityFamilyOfItemName, isCapacityUpgradeItemName, maxUpgradeJumpOf, upgradeItemName, upgradeItemOfName,
};
export type { CapacityUpgradeItem };
