/* @layer shared-game @kind types */
import type { CheckId, ShopSeamKind, ShopSlotPosition, ItemId, RegionId } from '@rotp/game-data';
import type { LocationKey, ShelfSide } from '../location-key';

type ShopWorld = 'light' | 'dark';

interface ShopSlotFacts {
  checkId: CheckId;
  shopId: string;
  shopName: string;
  region: RegionId;
  world: ShopWorld;
  position: ShopSlotPosition;
  seam: ShopSeamKind;
  vanillaItem: ItemId | undefined;
  price: number;
  subtype: number;
  roomId: number;
  entrance: number | null;
  owArea: number | null;
  canonicalIndex: number;
}

interface ShopSlotKeyRow {
  shop: string;
  side: ShelfSide;
}

interface ShopSlotLocation {
  slot: ShopSlotFacts;
  key: LocationKey;
  depthIndex: number;
}

interface ShopSlotRow {
  slot: ShopSlotFacts;
  key: string;
  label: string;
  defaultOn: boolean;
  canonicalIndex: number;
}

export type { ShopSlotFacts, ShopSlotKeyRow, ShopSlotLocation, ShopSlotRow, ShopWorld };
