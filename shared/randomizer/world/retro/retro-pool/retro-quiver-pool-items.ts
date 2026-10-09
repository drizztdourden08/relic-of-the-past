/* @layer shared-game @kind logic */
import { RETRO_QUIVER_ITEM } from '../retro-bow.data';
import { retroQuiverInPool } from '../retro-shops';
import type { ShopScope } from '../../shops/shop-scope.type';
import type { ItemKey } from '../../item-ids.data';
import type { RetroBowSetting } from '../retro.type';

const retroQuiverPoolItems = (
  scope: ShopScope | undefined, setting: RetroBowSetting | undefined,
): readonly ItemKey[] => (retroQuiverInPool(scope, setting) ? [RETRO_QUIVER_ITEM] : []);

export { retroQuiverPoolItems };
