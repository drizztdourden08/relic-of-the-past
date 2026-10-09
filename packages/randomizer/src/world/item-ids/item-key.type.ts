/* @layer shared-game @kind types */
import type { ItemId } from '@rotp/game-data';
import type { UNRECORDED_PREFIX } from './item-ids.constants';

type UnrecordedItem = `${typeof UNRECORDED_PREFIX}${string}`;

type ItemKey = ItemId | UnrecordedItem;

export type { ItemKey, UnrecordedItem };
