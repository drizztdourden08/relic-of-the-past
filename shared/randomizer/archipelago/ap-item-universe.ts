/* @layer shared-game @kind logic */
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

const apItemUniverse = (): readonly ItemKey[] => {
  const keys = new Set<ItemKey>([
    ...all('item').map((item) => item.id),
    ...capacityItems(),
    UNRECORDED.quiver,
  ]);
  return [...keys].sort(compareApKeys);
};

export { apItemUniverse };
