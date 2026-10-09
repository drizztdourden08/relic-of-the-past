/* @layer shared-game @kind logic */
import { UNRECORDED_PREFIX } from './item-ids.constants';
import type { ItemKey, UnrecordedItem } from './item-key.type';

const isUnrecordedItem = (item: ItemKey): item is UnrecordedItem => item.startsWith(UNRECORDED_PREFIX);

export { isUnrecordedItem };
