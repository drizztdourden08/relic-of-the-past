/* @layer shared-game @kind logic */
import { CAPACITY_UPGRADE_LOCATIONS } from '../../scope-tables';
import { POND_LOCATION_SET } from '../../pond/pond-rungs';
import { PRICED_ENTRIES } from '../priced-entries';
import { allOf } from '../combinators';
import { TABLE_TARGETS } from './prices.constants';
import { canAfford } from './can-afford';
import { pondAfford } from './pond-afford';
import { registerShopPriceRules } from './register-shop-price-rules';
import type { LocationKey } from '../../location-key.type';
import type { World, Rule } from '../../world.type';

const registerPriceRules = (world: World): void => {
  for (const { kind, target, price } of PRICED_ENTRIES) {
    const registry: Map<string, Rule> = kind === 'exit' ? world.rules : world.locationRules;
    const existing = registry.get(target);
    if (existing === undefined) {
      if (CAPACITY_UPGRADE_LOCATIONS.has(target as LocationKey)) continue;
      throw new Error(`price row targets unknown ${kind}: ${target}`);
    }
    const key = target as LocationKey;
    registry.set(target, allOf(existing, POND_LOCATION_SET.has(key) ? pondAfford(key) : canAfford(price)));
  }
  for (const key of world.locationsByKey.keys()) {
    if (!POND_LOCATION_SET.has(key) || TABLE_TARGETS.has(key)) continue;
    const existing = world.locationRules.get(key);
    if (existing === undefined) continue;
    world.locationRules.set(key, allOf(existing, pondAfford(key)));
  }
  registerShopPriceRules(world);
};

export { registerPriceRules };
