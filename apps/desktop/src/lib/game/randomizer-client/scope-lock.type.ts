/* @layer bridge-wasm @kind types */
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { ShopScope } from '@shared/randomizer/world/shops/shop-scope.type';
import type { ShopPriceView } from '@shared/randomizer/world/shops/shop-price.type';
import type { WishPondRungKey } from './wish-pond-rung-keys';

interface ScopeFlags {
  keyDropShuffle: boolean;
  includeNpcChecks: boolean;
  shufflePrizes?: boolean;
  includeWorldItems: boolean;
  npcLockedLocations?: ReadonlySet<LocationKey>;
  worldLockedLocations?: ReadonlySet<LocationKey>;
  capacityLockedLocations?: ReadonlySet<LocationKey>;
  pondLockedItems?: ReadonlyMap<LocationKey, ItemKey>;
  capacityStartTiers?: ReadonlyMap<string, number>;
  shops: ShopScope;
  shopPrices: ShopPriceView;
  pondPrizeLocations?: readonly LocationKey[];
  wishPondRungs?: ReadonlyMap<LocationKey, WishPondRungKey>;
  pondPrizeSlots?: ReadonlySet<LocationKey>;
}

export type { ScopeFlags };
