/* @layer shared-game @kind logic */
import { POOL_ITEM_OVERRIDES } from './pool-item-overrides.constants';
import type { ItemId, CheckRecord } from '@rotp/game-data';

const poolItemOfCheck = (check: CheckRecord): ItemId | undefined =>
  POOL_ITEM_OVERRIDES[check.id] ?? check.vanillaItemIds[0];

export { poolItemOfCheck };
