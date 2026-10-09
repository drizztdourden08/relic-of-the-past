/* @layer shared-game @kind logic */
import { shopSlotLocationOf } from '../../shops/shop-slots';
import { selfLockRuleOf } from '../../shops/shop-self-lock';
import { compileRule } from '../rule-eval';
import { seedKey, seededPriceNode } from '../seeded-price';
import { allOf } from '../combinators';
import type { World } from '../../world.type';

const registerShopPriceRules = (world: World): void => {
  const rolled = world.options.shopPrices;
  for (const key of world.locationsByKey.keys()) {
    const row = shopSlotLocationOf(key);
    if (row === undefined) continue;
    const existing = world.locationRules.get(key);
    if (existing === undefined) throw new Error(`shelf slot left unruled: ${key}`);
    const price = rolled?.[key] ?? { currency: 'rupees' as const, amount: row.slot.price };
    world.locationRules.set(key, allOf(existing, compileRule(seededPriceNode(seedKey.shopPrice(key)))));
    const selfLock = selfLockRuleOf(price);
    if (selfLock === undefined) continue;
    const allowed = world.getItemRule(key);
    world.itemRules.set(key, (item) => allowed(item) && selfLock(item));
  }
};

export { registerShopPriceRules };
