/* @layer shared-game @kind constants */
import { ITEM } from '../../item-ids';
import { CRYSTAL_ITEMS } from '../../item-groups';
import type { ItemId } from '@rotp/game-data';

const PENDANTS: readonly ItemId[] = [ITEM.redPendant, ITEM.bluePendant, ITEM.greenPendant];

const DARK_WORLD_CRYSTALS: readonly ItemId[] = CRYSTAL_ITEMS;

const ALL_PENDANTS = 3;

export { ALL_PENDANTS, DARK_WORLD_CRYSTALS, PENDANTS };
