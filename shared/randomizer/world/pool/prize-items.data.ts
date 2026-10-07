/* @layer shared-game @kind data */
/**
 * The prize pool: the ten crystal and pendant items placed on the ten dungeon prize locations
 * (the reference's pre_fill in worlds/alttp/__init__.py, transcribed from Items.py item_table's
 * Crystal rows). They never sit in the shuffled pool.
 */
import { ITEM } from '../item-ids.data';
import type { ItemId } from '@shared/game/data/types/ids';

const PRIZE_ITEMS: readonly ItemId[] = [
  ITEM.greenPendant,
  ITEM.bluePendant,
  ITEM.redPendant,
  ITEM.crystal1,
  ITEM.crystal2,
  ITEM.crystal3,
  ITEM.crystal4,
  ITEM.crystal5,
  ITEM.crystal6,
  ITEM.crystal7,
];

export { PRIZE_ITEMS };
