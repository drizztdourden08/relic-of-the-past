/* @layer shared-game @kind logic */
/**
 * The most a price may ask for in each counted currency: what the profile
 * can ever HOLD, because a price above that could never be paid, and under
 * full accessibility an unpayable shelf makes the seed ungeneratable rather
 * than merely hard.
 *
 * Rupees, arrows and bombs read the top rung their family's ladder reaches
 * under the capacity profile, so a vanilla wallet caps a rupee price at 999
 * however wide the option's range is opened and a custom wallet that stops
 * lower caps it lower still. Hearts read the seed's own heart ceiling
 * (difficulty/), less the one heart a payment must leave standing: with the
 * ceiling at its floor of three a shelf may ask for two at most.
 *
 * The panel and the roll both read these, so the range a player is shown
 * and the range a seed is drawn from can never disagree.
 */
import { EXPLOSIVES, PROJECTILES, WALLET } from '../capacity/capacity-family';
import { reachableTopOf } from '../capacity/reachable-top';
import { CURRENCY_ROWS } from './shop-price-options.data';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { ShopCountedCurrency, ShopPricePlan } from './shop-price.type';

/** The ceiling of one currency under this plan and profile. */
const ceilingOf = (currency: ShopCountedCurrency, plan: ShopPricePlan, profile: CapacityProfile): number => {
  if (currency === 'rupees') return reachableTopOf(WALLET, profile);
  if (currency === 'arrows') return reachableTopOf(PROJECTILES, profile);
  if (currency === 'bombs') return reachableTopOf(EXPLOSIVES, profile);
  return plan.heartCeiling;
};

/** Every counted currency's ceiling at once, for the panel's four ranges. */
const priceCeilingsOf = (
  plan: ShopPricePlan, profile: CapacityProfile,
): Readonly<Record<ShopCountedCurrency, number>> =>
  Object.fromEntries(
    CURRENCY_ROWS.map(({ currency }) => [currency, ceilingOf(currency, plan, profile)]),
  ) as Record<ShopCountedCurrency, number>;

export { ceilingOf, priceCeilingsOf };
