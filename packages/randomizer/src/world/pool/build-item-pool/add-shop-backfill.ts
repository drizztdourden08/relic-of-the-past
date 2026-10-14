/* @layer shared-game @kind logic */
import { retroQuiverPoolItems } from '../../retro/retro-pool';
import { SHOP_BACKFILL_ITEM } from './build-item-pool.constants';
import { openShopSlots } from './open-shop-slots';
import type { ItemKey } from '../../item-ids';
import type { RetroBowSetting } from '../../retro/retro.type';
import type { World } from '../../world.type';

const addShopBackfill = (pool: ItemKey[], world: World, retro: RetroBowSetting | undefined): void => {
  const quivers = retroQuiverPoolItems(world.options.shops, retro);
  const backfills = Math.max(0, openShopSlots(world) - quivers.length);
  for (let index = 0; index < backfills; index += 1) pool.push(SHOP_BACKFILL_ITEM);
  pool.push(...quivers);
};

export { addShopBackfill };
