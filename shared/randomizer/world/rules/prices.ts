/* @layer shared-game @kind logic */
/**
 * The wallet overlay: every priced check and passage (priced-entries.ts)
 * additionally needs a wallet that can hold its price, read off the wallet
 * ladder the profile and the collected upgrades reach. Applied AFTER coverage
 * is closed and AND-composed onto whatever the reference registered, so the
 * source's rule / always-open partition (and its pinned counts) is untouched
 * and a vanilla wallet (999, above every price) changes nothing. A row
 * naming a fairy slot absent from this world (its family is vanilla) is
 * skipped; any other unknown name is a porting error.
 *
 * The pond is the one priced surface whose price is not fixed: under a
 * non-legacy mode its plan says what each throw costs, so the plan's own
 * price replaces the table's hundred for every prize slot. That price is the
 * GUARANTEED WORST CASE: the dearest single throw that must be paid to reach
 * this prize, every earlier throw included.
 */
import type { LocationKey } from '../location-key';
import { CAPACITY_UPGRADE_LOCATIONS } from '../scope-tables';
import { POND_INSTANCES } from '../pond/pond-instances';
import { POND_LOCATION_SET } from '../pond/pond-rungs';
import { pondPlanOf } from '../pond/pond-plan';
import { walletCapacity } from '../state-helpers-capacity';
import { PRICED_ENTRIES } from './priced-entries';
import { shopSlotLocationOf } from '../shops/shop-slots';
import { selfLockRuleOf } from '../shops/shop-self-lock';
import { ruleForPrice } from './shop-prices';
import type { World, Rule } from '../world.type';
import type { ShopPrice } from '../shops/shop-price.type';

const canAfford = (price: number): Rule => (state) => walletCapacity(state) >= price;

/** Location to the price its pond charges for it; empty while every pond is legacy. */
const pondPricesOf = (world: World): ReadonlyMap<LocationKey, number> => {
  const { ponds, pondPrizeLocations } = world.options;
  const prices = new Map<LocationKey, number>();
  if (ponds === undefined) return prices;
  const prizes = new Set(pondPrizeLocations);
  for (const pond of POND_INSTANCES) {
    const setting = ponds[pond.id];
    if (setting.mode === 'capacity') continue;
    const plan = pondPlanOf(setting, pond);
    // Only a prize slot this world really sells is priced. A pond handing over its own pair
    // charges nothing for it, and a ladder the world does not carry (its seam unproven) prices
    // nothing at all, so those two names keep the rules they have always had.
    plan.locations.forEach((key, index) => {
      if (prizes.has(key)) prices.set(key, plan.worstPriceOfPrize[index]);
    });
  }
  return prices;
};

/**
 * The shelf slots this world opened, each charging the price the seed rolled
 * for it, or its own vanilla price when nothing was rolled. A restocked slot
 * charges that price AGAIN instead of a multiple of it: what these rules
 * express is that the wallet can HOLD the price, and rupees are farmable
 * between purchases, so a slot's third item needs the same wallet rung as its
 * first.
 *
 * The price also decides what the slot may HOLD: a shelf never sells the
 * capacity its own price is counted in (shops/shop-self-lock.ts).
 */
const registerShopPriceRules = (world: World): void => {
  const rolled = world.options.shopPrices;
  for (const key of world.locationsByKey.keys()) {
    const row = shopSlotLocationOf(key);
    if (row === undefined) continue;
    const existing = world.locationRules.get(key);
    if (existing === undefined) throw new Error(`shelf slot left unruled: ${key}`);
    // A rolled price replaces the shelf's own; with no roll the shelf keeps
    // charging the rupees the unmodified game charges.
    const price = rolled?.[key] ?? { currency: 'rupees' as const, amount: row.slot.price };
    const afford = ruleForPrice(price);
    world.locationRules.set(key, (state) => existing(state) && afford(state));
    // The shelf may not sell what its own price is counted in (shop-self-lock).
    const selfLock = selfLockRuleOf(price);
    if (selfLock === undefined) continue;
    const allowed = world.getItemRule(key);
    world.itemRules.set(key, (item) => allowed(item) && selfLock(item));
  }
};

const registerPriceRules = (world: World): void => {
  const pondPrices = pondPricesOf(world);
  for (const { kind, target, price } of PRICED_ENTRIES) {
    const registry: Map<string, Rule> = kind === 'exit' ? world.rules : world.locationRules;
    const existing = registry.get(target);
    if (existing === undefined) {
      if (CAPACITY_UPGRADE_LOCATIONS.has(target as LocationKey)) continue;
      throw new Error(`price row targets unknown ${kind}: ${target}`);
    }
    // A pond prize slot is priced by the pond's own plan, never by the table.
    const key = target as LocationKey;
    const afford = canAfford(POND_LOCATION_SET.has(key) ? pondPrices.get(key) ?? price : price);
    registry.set(target, (state) => existing(state) && afford(state));
  }
  // The prize slots the table does not list at all: everything past a pond's
  // two reference names, which exists only under a non-legacy pond.
  for (const [key, price] of pondPrices) {
    if (PRICED_ENTRIES.some((entry) => entry.target === key)) continue;
    const existing = world.locationRules.get(key);
    if (existing === undefined) continue;
    const afford = canAfford(price);
    world.locationRules.set(key, (state) => existing(state) && afford(state));
  }
  registerShopPriceRules(world);
};

export { canAfford, pondPricesOf, registerPriceRules };
