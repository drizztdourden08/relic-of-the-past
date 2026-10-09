/* @layer shared-game @kind logic */
import { buildAlwaysAllowEntries, buildItemRuleEntries } from '../tables/item-rules.data';
import { registerBunnyRules } from '../bunny';
import { registerPriceRules } from '../prices';
import { registerPondDemandRules } from '../pond-demands';
import { seedValuesOfWorld } from '../seed-values';
import { RULE_TABLES } from './register.constants';
import { applyEntry } from './apply-entry';
import { closeCoverage } from './close-coverage';
import { openShopSlots } from './open-shop-slots';
import type { World, Rule } from '../../world.type';
import type { RuleCoverageReport } from '../rules.type';

const registerRules = (world: World): RuleCoverageReport => {
  const exitNames = new Set<string>();
  for (const region of world.regions.values()) {
    for (const exit of region.exits) exitNames.add(exit.name);
  }
  for (const table of RULE_TABLES) {
    for (const entry of table) applyEntry(world, exitNames, entry);
  }
  registerBunnyRules(world);
  for (const entry of buildItemRuleEntries(world)) {
    if (!world.locationsByKey.has(entry.location)) continue;
    world.itemRules.set(entry.location, entry.allowed);
  }
  for (const entry of buildAlwaysAllowEntries(world)) {
    if (!world.locationsByKey.has(entry.location)) continue;
    world.alwaysAllow.set(entry.location, entry.rule);
  }
  const exits = closeCoverage(exitNames, world.rules);
  openShopSlots(world);
  const locations = closeCoverage(world.locationsByKey.keys(), world.locationRules as Map<string, Rule>);
  closeCoverage(world.eventsByKey.keys(), world.eventRules as Map<string, Rule>);
  registerPriceRules(world);
  registerPondDemandRules(world);
  for (const [key, value] of seedValuesOfWorld(world)) world.seedValues.set(key, value);
  return {
    ruledExits: exits.ruled,
    openExits: exits.open,
    ruledLocations: locations.ruled,
    openLocations: locations.open,
  };
};

export { registerRules };
