/* @layer shared-game @kind logic */
/**
 * The wallet overlay: every priced check and passage (tables/prices.data.ts)
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
 * this prize, so a gamble is read from its schedule, never from its odds.
 */
import { CAPACITY_UPGRADE_LOCATIONS } from '../special-locations.data';
import { POND_LOCATION_SET } from '../pond/pond-locations.data';
import { pondPlanOf } from '../pond/pond-plan';
import { walletCapacity } from '../state-helpers-capacity';
import { PRICED_ENTRIES } from './tables/prices.data';
import { shopSlotLocationOf } from '../shops/shop-slots';
import { ruleForPrice } from './shop-prices';
import type { ApWorld, Rule } from '../world.type';

const canAfford = (price: number): Rule => (state) => walletCapacity(state) >= price;

/** Location name → the price the pond charges for it; empty under the legacy pond. */
const pondPricesOf = (world: ApWorld): ReadonlyMap<string, number> => {
  const { pond, pondSeed } = world.options;
  const prices = new Map<string, number>();
  if (pond === undefined || pond.mode === 'capacity') return prices;
  const plan = pondPlanOf(pond, pondSeed ?? '');
  plan.locations.forEach((name, index) => prices.set(name, plan.worstPriceOfPrize[index]));
  return prices;
};

/**
 * The shelf slots this world opened, each charging its own vanilla price. A
 * restocked slot charges that price AGAIN instead of a multiple of it: what
 * these rules express is that the wallet can HOLD the price, and rupees are
 * farmable between purchases, so a slot's third item needs the same wallet
 * rung as its first.
 */
const registerShopPriceRules = (world: ApWorld): void => {
  const rolled = world.options.shopPrices;
  for (const name of world.locationsByName.keys()) {
    const row = shopSlotLocationOf(name);
    if (row === undefined) continue;
    const existing = world.locationRules.get(name);
    if (existing === undefined) throw new Error(`shelf slot left unruled: ${name}`);
    // A rolled price replaces the shelf's own; with no roll the shelf keeps
    // charging the rupees the unmodified game charges.
    const price = rolled?.[name] ?? { currency: 'rupees' as const, amount: row.slot.price };
    const afford = ruleForPrice(price);
    world.locationRules.set(name, (state) => existing(state) && afford(state));
  }
};

const registerPriceRules = (world: ApWorld): void => {
  const pondPrices = pondPricesOf(world);
  for (const { kind, name, price } of PRICED_ENTRIES) {
    const registry = kind === 'exit' ? world.rules : world.locationRules;
    const existing = registry.get(name);
    if (existing === undefined) {
      if (CAPACITY_UPGRADE_LOCATIONS.has(name)) continue;
      throw new Error(`price row targets unknown ${kind}: ${name}`);
    }
    // A pond prize slot is priced by the pond's own plan, never by the table.
    const afford = canAfford(POND_LOCATION_SET.has(name) ? pondPrices.get(name) ?? price : price);
    registry.set(name, (state) => existing(state) && afford(state));
  }
  // The prize slots the table does not list at all: everything past the
  // reference's two names, which exist only under a non-legacy pond.
  for (const [name, price] of pondPrices) {
    if (PRICED_ENTRIES.some((entry) => entry.name === name)) continue;
    const existing = world.locationRules.get(name);
    if (existing === undefined) continue;
    const afford = canAfford(price);
    world.locationRules.set(name, (state) => existing(state) && afford(state));
  }
  registerShopPriceRules(world);
};

export { canAfford, pondPricesOf, registerPriceRules };
