/* @layer tests @kind helper */
import { defaultShopScope } from '@rotp/randomizer';
import type { ShopScope } from '@rotp/randomizer';

const scopeWith = (ticked: readonly number[], mode: ShopScope['mode']): ShopScope => {
  const base = defaultShopScope();
  const enabled = [...new Set([...base.enabled, ...ticked])].sort((a, b) => a - b);
  return { ...base, mode, enabled, slotCount: enabled.length, depth: 2 };
};

export { scopeWith };
