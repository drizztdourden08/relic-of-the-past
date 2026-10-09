/* @layer tests @kind helper */
import { defaultShopScope } from '@shared/randomizer/world/shops/shop-scope-from-values';
import type { ShopScope } from '@shared/randomizer/world/shops/shop-scope.type';

const scopeWith = (ticked: readonly number[], mode: ShopScope['mode']): ShopScope => {
  const base = defaultShopScope();
  const enabled = [...new Set([...base.enabled, ...ticked])].sort((a, b) => a - b);
  return { ...base, mode, enabled, slotCount: enabled.length, depth: 2 };
};

export { scopeWith };
