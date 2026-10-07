/* @layer shared-game @kind logic */
/**
 * The rule registration pass: the port of the reference's set_rules driver
 * (Archipelago worlds/alttp/Rules.py 31-126) for the fixed baseline
 * options. Tables apply their rows in source order ('set' replaces, 'add'
 * AND-composes); the transform-suppression rules attach last, exactly as in
 * the reference. Afterwards coverage is made total: a name no table ruled asks
 * nothing and is registered open, because a passage with no rule is an open
 * passage. The wallet price overlay (prices.ts) goes on last, over the closed
 * registries.
 */
import { GLOBAL_MISC_RULES } from './tables/global-misc.data';
import { DEFAULT_OVERWORLD_RULES } from './tables/default-overworld.data';
import { STANDARD_RULES } from './tables/standard.data';
import { LAMP_RULES } from './tables/lamps.data';
import { COMPLETION_RULES } from './tables/completion.data';
import { FIRST_CASTLE_RULES } from './tables/dungeon-first-castle.data';
import { CASTLE_TOWER_RULES } from './tables/dungeon-castle-tower.data';
import { EAST_PALACE_RULES } from './tables/dungeon-east-palace.data';
import { DESERT_PALACE_RULES } from './tables/dungeon-desert-palace.data';
import { MOUNTAIN_TOWER_RULES } from './tables/dungeon-mountain-tower.data';
import { DARK_PALACE_RULES } from './tables/dungeon-dark-palace.data';
import { SWAMP_RULES } from './tables/dungeon-swamp.data';
import { WOODS_RULES } from './tables/dungeon-woods.data';
import { THIEVES_DEN_RULES } from './tables/dungeon-thieves-den.data';
import { ICE_RULES } from './tables/dungeon-ice.data';
import { MIRE_RULES } from './tables/dungeon-mire.data';
import { TURTLE_RULES } from './tables/dungeon-turtle.data';
import { FINAL_TOWER_RULES } from './tables/dungeon-final-tower.data';
import { buildAlwaysAllowEntries, buildItemRuleEntries } from './tables/item-rules.data';
import { KEY_DROP_LOCATIONS } from '../scope-tables';
import { isShopSlotLocation } from '../shops/shop-slots';
import { registerBunnyRules } from './bunny';
import { registerPriceRules } from './prices';
import { registerPondDemandRules } from './pond-demands';
import { seedValuesOfWorld } from './seed-values';
import { allOf, always, never } from './combinators';
import type { CheckId } from '@shared/game/data/types/ids';
import type { LocationKey } from '../location-key';
import type { World, Rule } from '../world.type';
import type { RuleEntry } from './rule-entry.type';

const RULE_TABLES: readonly (readonly RuleEntry[])[] = [
  GLOBAL_MISC_RULES,
  FIRST_CASTLE_RULES,
  CASTLE_TOWER_RULES,
  EAST_PALACE_RULES,
  DESERT_PALACE_RULES,
  MOUNTAIN_TOWER_RULES,
  DARK_PALACE_RULES,
  SWAMP_RULES,
  WOODS_RULES,
  THIEVES_DEN_RULES,
  ICE_RULES,
  MIRE_RULES,
  TURTLE_RULES,
  FINAL_TOWER_RULES,
  DEFAULT_OVERWORLD_RULES,
  // Rules.py 61-62: standard_rules runs after global/default and replaces
  // the escape rows those set; the lamp pass follows it, as in the source.
  STANDARD_RULES,
  COMPLETION_RULES,
  LAMP_RULES,
];

interface RuleCoverageReport {
  ruledExits: number;
  openExits: number;
  ruledLocations: number;
  openLocations: number;
}

const applyRule = (registry: Map<string, Rule>, entry: RuleEntry): void => {
  const { target, mode, rule } = entry;
  if (mode === 'set') {
    registry.set(target, rule);
    return;
  }
  const existing = registry.get(target);
  registry.set(target, existing === undefined ? rule : allOf(existing, rule));
};

const applyEntry = (world: World, exitNames: Set<string>, entry: RuleEntry): void => {
  if (entry.kind === 'exit') {
    if (!exitNames.has(entry.target)) throw new Error(`rule targets unknown exit: ${entry.target}`);
    applyRule(world.rules, entry);
    return;
  }
  if (entry.kind === 'event') {
    if (!world.eventsByKey.has(entry.target as CheckId)) throw new Error(`rule targets unknown event: ${entry.target}`);
    applyRule(world.eventRules as Map<string, Rule>, entry);
    return;
  }
  const key = entry.target as LocationKey;
  if (!world.locationsByKey.has(key)) {
    if (!world.options.keyDropShuffle && KEY_DROP_LOCATIONS.has(key as CheckId)) return;
    throw new Error(`rule targets unknown location: ${key}`);
  }
  applyRule(world.locationRules as Map<string, Rule>, entry);
};

/**
 * Coverage made total: a name no table ruled asks nothing, so it is registered open.
 *
 * NO ALWAYS-OPEN LIST. A passage with no rule on it IS an open passage, which is what the
 * connection record says by carrying no requirement, and a check with no rule is collectable
 * by reaching it. Listing those names a second time only let the list and the records
 * disagree. What a switch turns OFF is not this pass's business either: a scoped location its
 * switch excludes is not a location of the world at all (build-world.ts), so nothing here has
 * to close it.
 */
const closeCoverage = (
  names: Iterable<string>,
  registry: Map<string, Rule>,
): { ruled: number; open: number } => {
  let ruled = 0;
  let open = 0;
  for (const name of names) {
    if (registry.has(name)) {
      ruled += 1;
    } else {
      registry.set(name, always);
      open += 1;
    }
  }
  return { ruled, open };
};

/**
 * A shelf slot asks nothing beyond standing in the shop, the reference's
 * can_buy is "the shop's region is reachable". Only the slots the bunny pass
 * has not already ruled are opened here, so a dark-world shelf keeps its
 * transform condition; the price lands on top as a wallet condition in the
 * overlay that runs last.
 */
const openShopSlots = (world: World): void => {
  for (const key of world.locationsByKey.keys()) {
    if (isShopSlotLocation(key) && !world.locationRules.has(key)) {
      world.locationRules.set(key, always);
    }
  }
};

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
  // The demands a pond rolled sit on top of the wallet overlay, because a rung
  // is a ladder and the whole climb has to be payable, not only its own throw.
  registerPondDemandRules(world);
  // The values those seeded rules read: this world's prices and demands (seed-values.ts).
  for (const [key, value] of seedValuesOfWorld(world)) world.seedValues.set(key, value);
  return {
    ruledExits: exits.ruled,
    openExits: exits.open,
    ruledLocations: locations.ruled,
    openLocations: locations.open,
  };
};

export { registerRules };
export type { RuleCoverageReport };
