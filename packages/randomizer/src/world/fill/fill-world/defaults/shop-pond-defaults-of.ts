/* @layer shared-game @kind logic */
import { LEGACY_POND_PROFILES } from '../../../pond/pond-profile-defaults';
import { REFERENCE_DARK_ROOM_SETTING } from '../../../dark-rooms/dark-room-lights.constants';
import { DEFAULT_STORY_GATES } from '../../../story-gates/story-gates.constants';
import { NO_SHOP_SCOPE } from '../../../shops/shop-scope-from-values';
import { NO_SHOP_PRICES } from '../../fill.constants';
import type { FillWorldOptions } from '../../fill-world.type';
import type { ShopPondDefaults } from './fill-defaults.type';

const shopPondDefaultsOf = (options: FillWorldOptions): ShopPondDefaults => {
  const {
    shops = NO_SHOP_SCOPE, shopPrices = NO_SHOP_PRICES, ponds = LEGACY_POND_PROFILES,
    pondSlotsFollowMode = false, darkRooms = REFERENCE_DARK_ROOM_SETTING, storyGates = DEFAULT_STORY_GATES,
  } = options;
  return { shops, shopPrices, ponds, pondSlotsFollowMode, darkRooms, storyGates };
};

export { shopPondDefaultsOf };
