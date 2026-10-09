/* @layer shared-game @kind data */
import { ITEM } from '../../item-ids';
import type { CheckId, ItemId } from '@rotp/game-data';

const UNCLE_LOCATION: CheckId = 'check-017';

const UNCLE_SWORD_CANDIDATES: readonly ItemId[] = [
  ITEM.progressiveSword, ITEM.fighterSword, ITEM.masterSword, ITEM.temperedSword, ITEM.goldenSword,
];

const UNCLE_BOW_CANDIDATES: readonly ItemId[] = [ITEM.progressiveBow, ITEM.bow];

const UNCLE_ARSENAL_CANDIDATES: readonly ItemId[] = [
  ITEM.hammer, ITEM.fireRod, ITEM.caneOfSomaria, ITEM.caneOfByrna,
];

const UNCLE_BOMB_CANDIDATE: ItemId = ITEM.bombs10;

export {
  UNCLE_LOCATION,
  UNCLE_SWORD_CANDIDATES,
  UNCLE_BOW_CANDIDATES,
  UNCLE_ARSENAL_CANDIDATES,
  UNCLE_BOMB_CANDIDATE,
};
