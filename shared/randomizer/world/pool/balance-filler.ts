/* @layer shared-game @kind logic */
import { REPLACEMENT_FILLER } from './balance-filler.constants';
import { isFillerItem } from './is-filler-item';
import type { ItemKey } from '../item-ids.data';
import type { FillerPicker } from './pool.type';

const lastFiller: FillerPicker = (count) => count - 1;

const balanceFiller = (pool: ItemKey[], delta: number, pickIndex: FillerPicker = lastFiller): void => {
  for (let n = 0; n < delta; n += 1) {
    const fillerAt = pool.flatMap((item, index) => (isFillerItem(item) ? [index] : []));
    if (fillerAt.length === 0) throw new Error('no filler left to trim for capacity upgrades');
    pool.splice(fillerAt[pickIndex(fillerAt.length)], 1);
  }
  for (let n = delta; n < 0; n += 1) pool.push(REPLACEMENT_FILLER);
};

export { balanceFiller };
