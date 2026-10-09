/* @layer shared-game @kind logic */
import type { ItemId } from '../../../data';
import { SWORD_TIER_IDS } from './enemy-reach-weapons.constants';

const swordTier = (inventory: ReadonlySet<ItemId>): number =>
  SWORD_TIER_IDS.reduce((tier, id, i) => (inventory.has(id) ? i + 1 : tier), 0);

export { swordTier };
