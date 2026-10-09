/* @layer shared-game @kind logic */
import { EXPLOSIVES, PROJECTILES, WALLET } from '../capacity/capacity-family';
import { reachableTopOf } from '../capacity/reachable-top';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { ShopCountedCurrency, ShopPricePlan } from './shop-price.type';

const shopPriceCeilingOf = (currency: ShopCountedCurrency, plan: ShopPricePlan, profile: CapacityProfile): number => {
  if (currency === 'rupees') return reachableTopOf(WALLET, profile);
  if (currency === 'arrows') return reachableTopOf(PROJECTILES, profile);
  if (currency === 'bombs') return reachableTopOf(EXPLOSIVES, profile);
  return plan.heartCeiling;
};

export { shopPriceCeilingOf };
