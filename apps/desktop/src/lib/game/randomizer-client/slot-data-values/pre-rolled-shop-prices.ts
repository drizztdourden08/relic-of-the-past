/* @layer bridge-wasm @kind logic */
import { isPlainRecord } from './is-plain-record';
import type { ShopPriceView } from '@shared/randomizer/world/shops/shop-price.type';
import type { RotpSlotData } from '@shared/randomizer/archipelago/slot-data.type';

const preRolledShopPrices = (slotData: RotpSlotData): ShopPriceView | undefined => {
  const raw = slotData.preRolled?.shopPrices;
  return isPlainRecord(raw) ? raw as ShopPriceView : undefined;
};

export { preRolledShopPrices };
