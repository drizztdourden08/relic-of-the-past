/* @layer shared-game @kind logic */
import { normalizeEnabled } from '../../shops/shop-scope';
import { POTION_CAULDRONS } from '../potion-cauldrons.constants';
import type { ShopScope } from '../../shops/shop-scope.type';
import type { PotionCauldron } from '../potion-cauldron.type';

const lostCauldronsOf = (shops: ShopScope): readonly PotionCauldron[] => {
  if (shops.mode === 'vanilla') return [];
  const ticked = new Set(normalizeEnabled(shops.enabled));
  return POTION_CAULDRONS.filter((row) => ticked.has(row.canonicalIndex));
};

export { lostCauldronsOf };
