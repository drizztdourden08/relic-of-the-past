/* @layer shared-game @kind logic */
import { UNRECORDED_PREFIX } from './item-ids.data';
import type { UnrecordedItem } from './item-key.type';

const unrecordedItem = (name: string): UnrecordedItem => `${UNRECORDED_PREFIX}${name}`;

export { unrecordedItem };
