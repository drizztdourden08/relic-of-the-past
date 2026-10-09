/* @layer shared-game @kind logic */
import type { CapacityUpgradeItem } from './capacity-upgrade-item.type';
import { ITEM_BY_NAME } from './capacity-upgrade-item.constants';

const upgradeItemOfName = (itemName: string): CapacityUpgradeItem | undefined => ITEM_BY_NAME.get(itemName);

export { upgradeItemOfName };
