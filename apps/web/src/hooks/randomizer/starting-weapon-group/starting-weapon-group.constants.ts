/* @layer renderer-lib @kind constants */
import {
  UNCLE_ARSENAL_CANDIDATES, UNCLE_BOMB_CANDIDATE, UNCLE_BOW_CANDIDATES, UNCLE_SWORD_CANDIDATES,
} from '@shared/randomizer/world/pool/standard-escape.data';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';

const STARTING_WEAPON_GROUP_ID = 'starting-weapon';

const POOL_PARTITION_IDS: ReadonlySet<string> = new Set(['progression', 'useful', 'filler']);

const REFERENCE_ORDER: readonly ItemKey[] = [
  ...UNCLE_SWORD_CANDIDATES, ...UNCLE_BOW_CANDIDATES, ...UNCLE_ARSENAL_CANDIDATES, UNCLE_BOMB_CANDIDATE,
];

export { POOL_PARTITION_IDS, REFERENCE_ORDER, STARTING_WEAPON_GROUP_ID };
