/* @layer shared-game @kind logic */
import { FOREIGN_ITEM_KEY } from './foreign-item.constants';
import type { ItemKey } from '../../world/item-ids.data';

const isForeignItem = (item: ItemKey): boolean => item === FOREIGN_ITEM_KEY;

export { isForeignItem };
