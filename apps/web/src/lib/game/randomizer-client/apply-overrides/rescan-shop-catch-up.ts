/* @layer bridge-wasm @kind logic */
import { markLocationFired } from '../override-fire-registry';
import { armedShopState } from './armed-shop-state';
import { shopSlotAlreadySold } from './shop-slot-already-sold';

const rescanShopCatchUp = (): void => {
  for (const { location, slotIndex, depthIndex } of armedShopState.entries) {
    if (shopSlotAlreadySold(slotIndex, depthIndex)) markLocationFired(location);
  }
};

export { rescanShopCatchUp };
