/* @layer shared-game @kind logic */
import type { ShelfSide, ShopLocationKey } from '../location-key.type';

const shopLocationKey = (shop: string, side: ShelfSide, purchase: number): ShopLocationKey =>
  `${shop}-shelf_${side}-slot_${purchase}`;

export { shopLocationKey };
