/* @layer shared-game @kind logic */
/**
 * Transform-suppression rules: port of the reference's set_bunny_rules
 * (Archipelago worlds/alttp/Rules.py 1659-1788, non-inverted, no-glitches
 * branch only). A region is affected when it carries the second-world flag;
 * a region carrying only that flag requires the suppression item,
 * while a region flagged for both worlds gets the option search: reach it
 * through a chain of affected regions from a first-world-only region,
 * carrying every crossed entrance's access rule (get_rule_to_add,
 * 1696-1759). The reference adds the location rule once per inbound
 * entrance; AND-composition makes that idempotent, so it is added once.
 */
import type { CheckId, RegionId } from '@shared/game/data/types/ids';
import { ITEM } from '../item-ids.data';
import { BUNNY_ACCESSIBLE_LOCATIONS } from './tables/bunny-lists.data';
import { REGION } from '../region-ids.data';
import { bunnyImpassableRegionIds } from '../world-from-records';
import { anyOf } from './combinators';
import type { Exit, Region } from '../region.type';
import type { World, Rule } from '../world.type';

const suppressionItem: Rule = (state) => state.has(ITEM.moonPearl);

/** python state.can_reach(entrance): parent region + the entrance's own rule. */
const canUseExit = (world: World, exit: Exit): Rule => (state) => {
  if (!state.canReachRegion(exit.source)) return false;
  const rule = world.getRule(exit.name);
  return rule === undefined || rule(state);
};

const exitRule = (world: World, exit: Exit): Rule => (state) => {
  const rule = world.getRule(exit.name);
  return rule === undefined || rule(state);
};

/** python get_rule_to_add for a mixed region (1716-1759, glitchless path). */
const mixedRegionRule = (world: World, region: Region): Rule => {
  const options: Rule[] = [suppressionItem];
  const seen = new Set<RegionId>([region.id]);
  const queue: Array<[Region, Rule[]]> = [[region, []]];
  while (queue.length > 0) {
    const [current, path] = queue.shift() as [Region, Rule[]];
    for (const entrance of current.entrances) {
      const from = world.regions.get(entrance.source);
      if (from === undefined || seen.has(from.id)) continue;
      seen.add(from.id);
      const newPath = [...path, exitRule(world, entrance)];
      if (!from.isLightWorld) continue;
      if (from.isDarkWorld) {
        queue.push([from, newPath]);
      } else {
        const reach = canUseExit(world, entrance);
        options.push((state) => reach(state) && newPath.every((rule) => rule(state)));
      }
    }
  }
  return anyOf(...options);
};

/** python get_rule_to_add (1696-1714, glitchless): plain suppression unless mixed. */
const bunnyRegionRule = (world: World, region: Region): Rule =>
  (region.isLightWorld ? mixedRegionRule(world, region) : suppressionItem);

const addRule = (map: Map<string, Rule>, name: string, rule: Rule): void => {
  const existing = map.get(name);
  map.set(name, existing === undefined ? rule : (state) => existing(state) && rule(state));
};

const registerBunnyRules = (world: World): void => {
  // 1761-1767: affected multi-entrance interiors lock their exits. The records flag every one
  // of them; the mountain shop carries the flag too and is handled apart below, as the
  // reference handles it, so it is skipped here.
  for (const id of bunnyImpassableRegionIds()) {
    if (id === REGION.mountainShop) continue;
    const region = world.regions.get(id);
    if (region === undefined) throw new Error(`unknown impassable region: ${id}`);
    if (!region.isDarkWorld) continue;
    const rule = bunnyRegionRule(world, region);
    for (const exit of region.exits) addRule(world.rules, exit.name, rule);
  }
  // 1769-1771: the mountain shop entrance (a no-op in the open baseline).
  const shop = world.regions.get(REGION.mountainShop);
  if (shop !== undefined && shop.isDarkWorld && shop.entrances.length > 0) {
    addRule(world.rules, shop.entrances[0].name, bunnyRegionRule(world, shop));
  }
  // 1773-1788: locations in affected regions need the suppression rule.
  for (const region of world.regions.values()) {
    if (!region.isDarkWorld || region.entrances.length === 0) continue;
    if (region.locations.length === 0) continue;
    const rule = bunnyRegionRule(world, region);
    for (const location of region.locations) {
      if (BUNNY_ACCESSIBLE_LOCATIONS.has(location.key as CheckId)) continue;
      addRule(world.locationRules as Map<string, Rule>, location.key, rule);
    }
  }
};

export { registerBunnyRules };
