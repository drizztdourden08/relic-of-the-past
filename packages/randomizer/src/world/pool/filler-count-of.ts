/* @layer shared-game @kind logic */
import { isFillerItem } from './is-filler-item';
import type { ItemKey } from '../item-ids.data';

const fillerCountOf = (pool: readonly ItemKey[]): number => pool.filter(isFillerItem).length;

export { fillerCountOf };
