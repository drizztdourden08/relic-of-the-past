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
import { PRICED_ENTRIES } from './priced-entries';
import { shopSlotLocationOf } from '../shops/shop-slots';
import { selfLockRuleOf } from '../shops/shop-self-lock';
import { compileRule } from './rule-eval';
import { seedRef } from './rule-node-build';
import { seedKey, seededPriceNode } from './seeded-price';
import { allOf, helperRule } from './combinators';
import type { World, Rule } from '../world.type';

const canAfford = (price: number): Rule => helperRule('walletAtLeast', price);

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
    // The tree reads the price off the seed table (seed-values.ts), so it keeps one shape for
    // every seed; the item rule below is a placement predicate and reads the price itself.
    const price = rolled?.[key] ?? { currency: 'rupees' as const, amount: row.slot.price };
    world.locationRules.set(key, allOf(existing, compileRule(seededPriceNode(seedKey.shopPrice(key)))));
    // The shelf may not sell what its own price is counted in (shop-self-lock).
    const selfLock = selfLockRuleOf(price);
    if (selfLock === undefined) continue;
    const allowed = world.getItemRule(key);
    world.itemRules.set(key, (item) => allowed(item) && selfLock(item));
  }
};

/** A pond slot's wallet reading, its rupees read off the seed table (0 asks nothing). */
const pondAfford = (key: LocationKey): Rule => helperRule('walletAtLeast', seedRef(seedKey.pondPrice(key)));

const TABLE_TARGETS: ReadonlySet<string> = new Set(PRICED_ENTRIES.map((entry) => entry.target));

/**
 * Every pond slot this world holds is priced from the seed table: the pond plan's worst case
 * when the plan sells it, the table's row otherwise, nothing at all for a slot neither prices.
 * Registering every slot the same way is what keeps the tree the same for every setting.
 */
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
  // The pond slots the table does not list at all: everything past a pond's two reference names.
  for (const key of world.locationsByKey.keys()) {
    if (!POND_LOCATION_SET.has(key) || TABLE_TARGETS.has(key)) continue;
    const existing = world.locationRules.get(key);
    if (existing === undefined) continue;
    world.locationRules.set(key, allOf(existing, pondAfford(key)));
  }
  registerShopPriceRules(world);
};

export { canAfford, pondPricesOf, registerPriceRules };
