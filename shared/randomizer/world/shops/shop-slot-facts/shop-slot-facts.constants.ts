/* @layer shared-game @kind constants */
import { all } from '@shared/game/data';
import { shopSlotFactsOf } from './shop-slot-facts-of';
import type { ShopSlotFacts, ShopWorld } from '../shop-slot.type';

const CANONICAL_SLOTS: readonly ShopSlotFacts[] = all('check')
  .filter((check) => check.kind === 'shop-slot')
  .map(shopSlotFactsOf)
  .sort((a, b) => a.canonicalIndex - b.canonicalIndex);

const SHOP_IDS: readonly string[] = [...new Set(CANONICAL_SLOTS.map((row) => row.shopId))];

const STANDARD_SHOP_SLOT_COUNT = CANONICAL_SLOTS.length;

const SHOP_WORLD_LABELS: Readonly<Record<ShopWorld, string>> = {
  light: 'Light World',
  dark: 'Dark World',
};

export { CANONICAL_SLOTS, SHOP_IDS, SHOP_WORLD_LABELS, STANDARD_SHOP_SLOT_COUNT };
