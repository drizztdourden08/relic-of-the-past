/* @layer shared-game @kind logic */
import { POND_INSTANCES } from '../pond/pond-instances';
import { POND_LOCATION_SET, POND_RUNGS_BY_ID } from '../pond/pond-rungs';
import { pondPlanOf } from '../pond/pond-plan';
import { selfLockRuleOf } from '../shops/shop-self-lock';
import { compileRule } from './rule-eval';
import { TRUE, all, seedIs, when } from './rule-node-build';
import { seedKey, seededPriceNode } from './seeded-price';
import { allOf } from './combinators';
import type { World } from '../world.type';
import type { LocationKey } from '../location-key.type';
import type { RuleNode } from './rule-node.type';
import type { ShopPrice } from '../shops/shop-price.type';

const applySelfLock = (world: World, key: LocationKey, demand: ShopPrice): void => {
  const lock = selfLockRuleOf(demand);
  if (lock === undefined) return;
  const existing = world.itemRules.get(key);
  world.itemRules.set(
    key,
    existing === undefined ? lock : (item) => existing(item) && lock(item),
  );
};

const registerLadder = (world: World, rungs: readonly LocationKey[]): void => {
  const climb: RuleNode[] = [];
  for (const key of rungs) {
    climb.push(seededPriceNode(seedKey.pondDemand(key)));
    const existing = world.locationRules.get(key);
    if (existing === undefined) continue;
    const gate = when(seedIs(seedKey.pondGated(key), true), all(...climb), TRUE);
    world.locationRules.set(key, allOf(existing, compileRule(gate)));
  }
};

const registerSelfLocks = (world: World): void => {
  const { ponds, pondDemands, pondPrizeLocations } = world.options;
  if (ponds === undefined || pondDemands === undefined) return;
  const prizes = new Set(pondPrizeLocations);
  for (const pond of POND_INSTANCES) {
    const setting = ponds[pond.id];
    if (setting.mode === 'capacity') continue;
    for (const key of pondPlanOf(setting, pond).locations) {
      const demand = pondDemands[key];
      if (demand === undefined || !POND_LOCATION_SET.has(key)) continue;
      if (world.locationRules.has(key) && prizes.has(key)) applySelfLock(world, key, demand);
    }
  }
};

const registerPondDemandRules = (world: World): void => {
  for (const pond of POND_INSTANCES) registerLadder(world, POND_RUNGS_BY_ID[pond.id]);
  registerSelfLocks(world);
};

export { registerPondDemandRules };
