/* @layer shared-game @kind logic */
/**
 * Every item that can ever enter the pool, under any option.
 *
 * That is every item record, plus the items no record answers for yet: every capacity
 * upgrade a family's name table can mint (each jump size and the progressive item) and the
 * retro quiver. Taking every record errs on the wide side on purpose. A spare id costs
 * nothing, and an item missing from the table would stop a multiworld at the first grant.
 */
import { all } from '@shared/game/data';
import {
  CAPACITY_FAMILY_IDS, CAPACITY_PROGRESSIVE_NAMES, CAPACITY_UPGRADE_NAMES,
} from '@shared/game/data/capacity-upgrade-names.data';
import { itemKeyOfName } from '../world/display-names';
import { UNRECORDED } from '../world/item-ids.data';
import { compareApKeys } from './ap-key-order';
import type { ItemKey } from '../world/item-ids.data';

const capacityItems = (): readonly ItemKey[] => CAPACITY_FAMILY_IDS
  .flatMap((family) => [...CAPACITY_UPGRADE_NAMES[family], CAPACITY_PROGRESSIVE_NAMES[family]])
  .map(itemKeyOfName);

/** The whole item set, in natural key order. */
const apItemUniverse = (): readonly ItemKey[] => {
  const keys = new Set<ItemKey>([
    ...all('item').map((item) => item.id),
    ...capacityItems(),
    UNRECORDED.quiver,
  ]);
  return [...keys].sort(compareApKeys);
};

export { apItemUniverse };
