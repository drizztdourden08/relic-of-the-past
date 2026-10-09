/* @layer shared-game @kind logic */
import { isSlotKey } from '../location-key';
import { shopSlotLocationOf } from '../shops/shop-slots';
import type { CheckId } from '@shared/game/data/types/ids';

const checkIdOfLocation = (key: string): CheckId | undefined => {
  const shop = shopSlotLocationOf(key);
  if (shop !== undefined) return shop.depthIndex === 0 ? shop.slot.checkId : undefined;
  return isSlotKey(key) ? undefined : key as CheckId;
};

export { checkIdOfLocation };
