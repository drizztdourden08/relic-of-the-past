/* @layer shared-game @kind logic */
import { isProgressiveCapacityItemName } from '../capacity-progressive-item';
import { ITEM_BY_NAME } from './capacity-upgrade-item.constants';

const isCapacityUpgradeItemName = (itemName: string): boolean =>
  ITEM_BY_NAME.has(itemName) || isProgressiveCapacityItemName(itemName);

export { isCapacityUpgradeItemName };
