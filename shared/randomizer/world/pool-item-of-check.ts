/* @layer shared-game @kind logic */
import { POOL_ITEM_OVERRIDES } from './pool-item-overrides.data';
import type { ItemId } from '@shared/game/data/types/ids';
import type { CheckRecord } from '@shared/game/data';

const poolItemOfCheck = (check: CheckRecord): ItemId | undefined =>
  POOL_ITEM_OVERRIDES[check.id] ?? check.vanillaItemIds[0];

export { poolItemOfCheck };
