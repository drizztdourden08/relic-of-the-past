/* @layer shared-game @kind logic */
import { DUNGEON_ORDER } from '../fill/dungeon-order.data';
import { worldDungeonOf } from '../world-dungeon';
import { GOAL_EVENT } from '../events/story-events.data';
import { ALLOW_ANY_ITEM } from './build-world.constants';
import { wiredRegionsOf } from './wired-regions-of';
import type { CheckId } from '@shared/game/data/types/ids';
import type { LocationKey } from '../location-key.type';
import type { WorldEvent, WorldLocation } from '../region.type';
import type { World, ItemRule, Rule } from '../world.type';

const buildWorld = (options: World['options']): World => {
  const regions = wiredRegionsOf(options);
  const locationsByKey = new Map<LocationKey, WorldLocation>();
  const eventsByKey = new Map<CheckId, WorldEvent>();
  for (const region of regions.values()) {
    for (const location of region.locations) {
      if (locationsByKey.has(location.key)) throw new Error(`duplicate location: ${location.key}`);
      locationsByKey.set(location.key, location);
    }
    for (const event of region.events) eventsByKey.set(event.key, event);
  }
  const dungeons = new Map(DUNGEON_ORDER.map(worldDungeonOf).map((dungeon) => [dungeon.name, dungeon]));
  const rules = new Map<string, Rule>();
  const locationRules = new Map<LocationKey, Rule>();
  const eventRules = new Map<CheckId, Rule>();
  const itemRules = new Map<LocationKey, ItemRule>();
  return {
    regions,
    locationsByKey,
    eventsByKey,
    dungeons,
    options,
    rules,
    locationRules,
    eventRules,
    itemRules,
    alwaysAllow: new Map(),
    placedItems: new Map(),
    seedValues: new Map(),
    getRule: (name) => rules.get(name),
    getLocationRule: (key) => locationRules.get(key),
    getEventRule: (key) => eventRules.get(key),
    getItemRule: (key) => itemRules.get(key) ?? ALLOW_ANY_ITEM,
    isBeaten: (state) => state.has(GOAL_EVENT),
  };
};

export { buildWorld };
