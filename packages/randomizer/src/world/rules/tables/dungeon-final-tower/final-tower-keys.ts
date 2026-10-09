/* @layer shared-game @kind logic */
import { ITEM } from '../../../item-ids';
import { hasKeys } from '../../combinators';
import type { Rule } from '../../../world.type';

const finalTowerKeys = (count: number): Rule => hasKeys(ITEM.smallKeyGanonsTower, count);

export { finalTowerKeys };
