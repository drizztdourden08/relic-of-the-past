/* @layer shared-game @kind logic */
import { FAMILY_BY_PROGRESSIVE_NAME } from './capacity-progressive-item.constants';

const isProgressiveCapacityItemName = (itemName: string): boolean => FAMILY_BY_PROGRESSIVE_NAME.has(itemName);

export { isProgressiveCapacityItemName };
