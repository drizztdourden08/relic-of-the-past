/* @layer shared-game @kind logic */
import { all } from '@rotp/game-data';
import type { ItemKey } from '../item-ids';

const itemsClassed = (poolClass: 'progression' | 'useful'): readonly ItemKey[] =>
  all('item').filter((item) => item.poolClass === poolClass).map((item) => item.id);

export { itemsClassed };
