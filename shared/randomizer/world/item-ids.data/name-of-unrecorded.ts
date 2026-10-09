/* @layer shared-game @kind logic */
import { UNRECORDED_PREFIX } from './item-ids.data';
import type { UnrecordedItem } from './item-key.type';

const nameOfUnrecorded = (item: UnrecordedItem): string => item.slice(UNRECORDED_PREFIX.length);

export { nameOfUnrecorded };
