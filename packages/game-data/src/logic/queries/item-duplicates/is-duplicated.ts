/* @layer shared-game @kind logic */
import type { ItemId } from '../../../data';
import { resolveDuplicate } from './resolve-duplicate';

const isDuplicated = (itemId: number, owned: ReadonlySet<ItemId>): boolean =>
  resolveDuplicate(itemId, owned) !== itemId;

export { isDuplicated };
