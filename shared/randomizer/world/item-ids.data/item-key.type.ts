/* @layer shared-game @kind types */
import type { ItemId } from '@shared/game/data/types/ids';
import type { UNRECORDED_PREFIX } from './item-ids.data';

type UnrecordedItem = `${typeof UNRECORDED_PREFIX}${string}`;

type ItemKey = ItemId | UnrecordedItem;

export type { ItemKey, UnrecordedItem };
