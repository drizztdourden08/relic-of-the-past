/* @layer shared-game @kind logic */
import { getScreen } from '@shared/game/data';
import type { CheckRecord, ShopSlotPosition } from '@shared/game/data';
import type { ShopSlotFacts } from '../shop-slot.type';

const shopNameOf = (name: string, position: ShopSlotPosition): string =>
  (position === 'Single' ? name : name.slice(0, name.length - position.length - 1));

const shopSlotFactsOf = (check: CheckRecord): ShopSlotFacts => {
  const { shop, gameId, name, price, vanillaItemIds, screenId, regionId } = check;
  if (shop === undefined || gameId.shopSeam === undefined || price === undefined) {
    throw new Error(`shop-slot check without a shop, a seam or a price: ${check.id}`);
  }
  if (regionId === undefined) throw new Error(`shop-slot check with no region: ${check.id}`);
  const shopName = shopNameOf(name, shop.position);
  const [vanillaItemId] = vanillaItemIds;
  return {
    checkId: check.id,
    shopId: shop.shopId,
    shopName,
    region: regionId,
    world: screenId !== undefined && getScreen(screenId).world === 'dark' ? 'dark' : 'light',
    position: shop.position,
    seam: shop.seam,
    vanillaItem: vanillaItemId,
    price,
    subtype: gameId.shopSeam.subtype,
    roomId: gameId.shopSeam.roomId,
    entrance: gameId.shopSeam.entrance,
    owArea: gameId.shopSeam.owArea,
    canonicalIndex: shop.slot,
  };
};

export { shopSlotFactsOf };
