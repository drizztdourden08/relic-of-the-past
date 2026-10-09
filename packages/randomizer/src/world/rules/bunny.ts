/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids.data';
import { BUNNY_ACCESSIBLE_LOCATIONS } from './tables/bunny-lists.data';
import { REGION } from '../region-ids.data';
import { bunnyImpassableRegionIds } from '../world-from-records';
import {
  allOf, anyOf, canReach, exitRule as registeredExitRule, hasItem,
} from './combinators';
import type { CheckId, RegionId } from '@rotp/game-data';
import type { Exit, Region } from '../region.type';
import type { World, Rule } from '../world.type';

const suppressionItem: Rule = hasItem(ITEM.moonPearl);

const canUseExit = (exit: Exit): Rule => allOf(canReach(exit.source), registeredExitRule(exit.name));

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
      const newPath = [...path, registeredExitRule(entrance.name)];
      if (!from.isLightWorld) continue;
      if (from.isDarkWorld) {
        queue.push([from, newPath]);
      } else {
        const reach = canUseExit(entrance);
        options.push(allOf(reach, ...newPath));
      }
    }
  }
  return anyOf(...options);
};

const bunnyRegionRule = (world: World, region: Region): Rule =>
  (region.isLightWorld ? mixedRegionRule(world, region) : suppressionItem);

const addRule = (map: Map<string, Rule>, name: string, rule: Rule): void => {
  const existing = map.get(name);
  map.set(name, existing === undefined ? rule : allOf(existing, rule));
};

const registerBunnyRules = (world: World): void => {
  for (const id of bunnyImpassableRegionIds()) {
    if (id === REGION.mountainShop) continue;
    const region = world.regions.get(id);
    if (region === undefined) throw new Error(`unknown impassable region: ${id}`);
    if (!region.isDarkWorld) continue;
    const rule = bunnyRegionRule(world, region);
    for (const exit of region.exits) addRule(world.rules, exit.name, rule);
  }
  const shop = world.regions.get(REGION.mountainShop);
  if (shop !== undefined && shop.isDarkWorld && shop.entrances.length > 0) {
    addRule(world.rules, shop.entrances[0].name, bunnyRegionRule(world, shop));
  }
  for (const region of world.regions.values()) {
    if (!region.isDarkWorld || region.entrances.length === 0) continue;
    if (region.locations.length === 0 && region.events.length === 0) continue;
    const rule = bunnyRegionRule(world, region);
    for (const location of region.locations) {
      if (BUNNY_ACCESSIBLE_LOCATIONS.has(location.key as CheckId)) continue;
      addRule(world.locationRules as Map<string, Rule>, location.key, rule);
    }
    for (const event of region.events) {
      if (BUNNY_ACCESSIBLE_LOCATIONS.has(event.key)) continue;
      addRule(world.eventRules as Map<string, Rule>, event.key, rule);
    }
  }
};

export { registerBunnyRules };
