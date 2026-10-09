/* @layer shared-game @kind constants */
import { CAPACITY_FAMILY_IDS, CAPACITY_UPGRADE_NAMES } from '../capacity-upgrade-names.constants';
import type { CapacityUpgradeItem } from './capacity-upgrade-item.type';

const ITEM_BY_NAME: ReadonlyMap<string, CapacityUpgradeItem> = new Map(
  CAPACITY_FAMILY_IDS.flatMap((family) =>
    CAPACITY_UPGRADE_NAMES[family].map((name, index): [string, CapacityUpgradeItem] =>
      [name, { family, jump: index + 1 }])),
);

export { ITEM_BY_NAME };
