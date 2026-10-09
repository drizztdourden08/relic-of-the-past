/* @layer shared-game @kind logic */
import { all } from '@shared/game/data';
import type { ItemKey } from '../item-ids.data';

const itemsClassed = (poolClass: 'progression' | 'useful'): readonly ItemKey[] =>
  all('item').filter((item) => item.poolClass === poolClass).map((item) => item.id);

export { itemsClassed };
