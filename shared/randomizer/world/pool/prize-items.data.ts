/* @layer shared-game @kind data */
import { ITEM } from '../item-ids.data';
import type { ItemId } from '@rotp/game-data';

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
