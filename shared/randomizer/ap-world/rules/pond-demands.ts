/* @layer shared-game @kind logic */
/**
 * A pond rung is a LADDER, and this is the rule that says so.
 *
 * Rung k asks for three things: the pond reachable (its region rule, already
 * registered), rung k-1 taken, and its own demand payable. The middle one is
 * what a ladder means, and the rule language has one honest way to say it: to
 * stand at rung k the player must have made every throw before it, so rung k
 * carries the demands of rungs 0..k, AND-composed in rung order. That is the
 * same reading the wallet overlay already makes of a rupee ladder (its
 * worst-case price is the dearest throw on the way), widened to every currency
 * a demand can name.
 *
 * Every currency is read by the shop's own price rule (rules/shop-prices.ts),
 * so a bomb demand at a pond and a bomb price on a shelf ask for exactly the
 * same thing. An item demand also locks its own rung against the item it names
 * (shops/shop-self-lock.ts): a rung reachable only by holding item X cannot be
 * the rung that hands X over.
 */
import { POND_INSTANCES } from '../pond/pond-instances.data';
import { POND_LOCATION_SET } from '../pond/pond-locations.data';
import { pondPlanOf } from '../pond/pond-plan';
import { selfLockRuleOf } from '../shops/shop-self-lock';
import { ruleForPrice } from './shop-prices';
import type { ApWorld, Rule } from '../world.type';
import type { ShopPrice } from '../shops/shop-price.type';

/** The named item cannot sit on the rung that asks to see it. */
const applySelfLock = (world: ApWorld, name: string, demand: ShopPrice): void => {
  const lock = selfLockRuleOf(demand);
  if (lock === null) return;
  const existing = world.itemRules.get(name);
  world.itemRules.set(
    name,
    existing === undefined ? lock : (itemName) => existing(itemName) && lock(itemName),
  );
};

/** One pond's rungs, each gated by every demand up to and including its own. */
const registerLadder = (world: ApWorld, rungs: readonly string[], demands: Record<string, ShopPrice>): void => {
  let climb: Rule | undefined;
  for (const name of rungs) {
    const demand = demands[name];
    if (demand === undefined) continue;
    const afford = ruleForPrice(demand);
    const earlier = climb;
    const gate: Rule = earlier === undefined ? afford : (state) => earlier(state) && afford(state);
    climb = gate;
    const existing = world.locationRules.get(name);
    if (existing === undefined) continue;
    world.locationRules.set(name, (state) => existing(state) && gate(state));
    applySelfLock(world, name, demand);
  }
};

/**
 * The demands this seed rolled, over the rungs each pond really has. Nothing
 * rolled (every pond legacy, or a placement frozen before the demands existed)
 * registers nothing at all, so such a seed keeps the rules it was built with.
 *
 * Which ponds may carry one is the ROLL's question, not this one
 * (pond/pond-demand-seed.ts: a custom pond and nothing else). This reads
 * whatever the placement carries and never re-decides it, which is what keeps
 * an already generated seed on the rules it was verified against.
 */
const registerPondDemandRules = (world: ApWorld): void => {
  const { ponds, pondDemands } = world.options;
  if (ponds === undefined || pondDemands === undefined) return;
  const demands = pondDemands as Record<string, ShopPrice>;
  for (const pond of POND_INSTANCES) {
    const setting = ponds[pond.id];
    if (setting.mode === 'capacity') continue;
    const rungs = pondPlanOf(setting, pond).locations.filter((name) => POND_LOCATION_SET.has(name));
    registerLadder(world, rungs, demands);
  }
};

export { registerPondDemandRules };
