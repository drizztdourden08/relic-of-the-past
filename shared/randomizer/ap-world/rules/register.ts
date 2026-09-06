/* @layer shared-game @kind logic */
/**
 * The rule registration pass: the port of the reference's set_rules driver
 * (Archipelago worlds/alttp/Rules.py 31-126) for the fixed baseline
 * options. Tables apply their rows in source order ('set' replaces, 'add'
 * AND-composes); the transform-suppression rules attach last, exactly as in
 * the reference. Afterwards coverage is made total: any name in neither a
 * table nor the always-open list is registered blocked and reported, so a
 * missing rule fails visibly instead of silently opening. The wallet price
 * overlay (prices.ts) goes on last, over the closed registries.
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
import { ALWAYS_OPEN_EXITS, ALWAYS_OPEN_LOCATIONS } from './tables/always-open.data';
import { buildAlwaysAllowEntries, buildItemRuleEntries } from './tables/item-rules.data';
import { KEY_DROP_LOCATIONS } from '../special-locations.data';
import { isShopSlotLocation } from '../shops/shop-slots';
import { registerBunnyRules } from './bunny';
import { registerPriceRules } from './prices';
import { always, never } from './combinators';
import type { ApWorld, Rule } from '../world.type';
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
  blockedExits: string[];
  ruledLocations: number;
  openLocations: number;
  blockedLocations: string[];
}

const applyRule = (registry: Map<string, Rule>, entry: RuleEntry): void => {
  const { name, mode, rule } = entry;
  if (mode === 'set') {
    registry.set(name, rule);
    return;
  }
  const existing = registry.get(name);
  registry.set(name, existing === undefined ? rule : (state) => existing(state) && rule(state));
};

const applyEntry = (world: ApWorld, exitNames: Set<string>, entry: RuleEntry): void => {
  if (entry.kind === 'exit') {
    if (!exitNames.has(entry.name)) throw new Error(`rule targets unknown exit: ${entry.name}`);
    applyRule(world.rules, entry);
    return;
  }
  if (!world.locationsByName.has(entry.name)) {
    if (!world.options.keyDropShuffle && KEY_DROP_LOCATIONS.has(entry.name)) return;
    throw new Error(`rule targets unknown location: ${entry.name}`);
  }
  applyRule(world.locationRules, entry);
};

const closeCoverage = (
  names: Iterable<string>,
  registry: Map<string, Rule>,
  alwaysOpen: readonly string[],
): { ruled: number; open: number; blocked: string[] } => {
  const openSet = new Set(alwaysOpen);
  let ruled = 0;
  let open = 0;
  const blocked: string[] = [];
  for (const name of names) {
    if (registry.has(name)) {
      if (openSet.has(name)) throw new Error(`always-open name has a rule: ${name}`);
      ruled += 1;
    } else if (openSet.has(name)) {
      registry.set(name, always);
      open += 1;
    } else {
      registry.set(name, never);
      blocked.push(name);
    }
  }
  return { ruled, open, blocked };
};

/**
 * A shelf slot asks nothing beyond standing in the shop, the reference's
 * can_buy is "the shop's region is reachable". Only the slots the bunny pass
 * has not already ruled are opened here, so a dark-world shelf keeps its
 * transform condition; the price lands on top as a wallet condition in the
 * overlay that runs last.
 */
const openShopSlots = (world: ApWorld): void => {
  for (const name of world.locationsByName.keys()) {
    if (isShopSlotLocation(name) && !world.locationRules.has(name)) {
      world.locationRules.set(name, always);
    }
  }
};

const registerRules = (world: ApWorld): RuleCoverageReport => {
  const exitNames = new Set<string>();
  for (const region of world.regions.values()) {
    for (const exit of region.exits) exitNames.add(exit.name);
  }
  for (const table of RULE_TABLES) {
    for (const entry of table) applyEntry(world, exitNames, entry);
  }
  registerBunnyRules(world);
  for (const entry of buildItemRuleEntries(world)) {
    if (!world.locationsByName.has(entry.location)) continue;
    world.itemRules.set(entry.location, entry.allowed);
  }
  for (const entry of buildAlwaysAllowEntries(world)) {
    if (!world.locationsByName.has(entry.location)) continue;
    world.alwaysAllow.set(entry.location, entry.rule);
  }
  const exits = closeCoverage(exitNames, world.rules, ALWAYS_OPEN_EXITS);
  openShopSlots(world);
  const locations = closeCoverage(
    world.locationsByName.keys(),
    world.locationRules,
    ALWAYS_OPEN_LOCATIONS.filter(
      (name) => world.options.keyDropShuffle || !KEY_DROP_LOCATIONS.has(name),
    ),
  );
  registerPriceRules(world);
  return {
    ruledExits: exits.ruled,
    openExits: exits.open,
    blockedExits: exits.blocked,
    ruledLocations: locations.ruled,
    openLocations: locations.open,
    blockedLocations: locations.blocked,
  };
};

export { registerRules };
export type { RuleCoverageReport };
