/* @layer shared-game @kind logic */
import { hasItem } from './has-item';
import type { ItemKey } from '../../item-ids';
import type { Rule } from '../../world.type';

const hasKeys = (item: ItemKey, count = 1): Rule => hasItem(item, count);

export { hasKeys };
