/* @layer shared-game @kind constants */
import {
  UNCLE_ARSENAL_CANDIDATES, UNCLE_BOMB_CANDIDATE, UNCLE_BOW_CANDIDATES, UNCLE_SWORD_CANDIDATES,
} from './standard-escape.constants';
import type { ItemId } from '@rotp/game-data';

const UNCLE_USABLE_WEAPONS: ReadonlySet<ItemId> = new Set<ItemId>([
  ...UNCLE_SWORD_CANDIDATES,
  ...UNCLE_BOW_CANDIDATES,
  ...UNCLE_ARSENAL_CANDIDATES,
  UNCLE_BOMB_CANDIDATE,
]);

export { UNCLE_USABLE_WEAPONS };
