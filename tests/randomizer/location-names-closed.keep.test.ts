/* @layer tests @kind test */
/**
 * Closed-world guard over locations, now that the engine reads them off the records.
 *
 * Every spot of the world is a check row the one rule picks out (world/seed-locations.ts), so
 * the world the graph declares IS the set every other table has to agree with. The id-keyed
 * tables are checked against it: every key they name has to be a location the world really
 * holds. Most of those reach the rule registry, which throws on an unknown target; the tables
 * listed here do not, so a stale id would sit there doing nothing.
 *
 * Normal is a placement over that same world, so the other direction is its own: it must fill
 * every declared location, and nothing else.
 */
import { describe, expect, it } from 'vitest';
import { buildNormalPlacement, normalWorldOptions } from '@shared/randomizer/normal-placement';
import { buildWorld } from '@shared/randomizer/world/build-world';
import {
  CAPACITY_UPGRADE_LOCATIONS, KEY_DROP_LOCATIONS, NPC_SCOPE_LOCATIONS, PRIZE_LOCATIONS, VANILLA_PRIZES,
  WORLD_ITEM_SCOPE_LOCATIONS,
} from '@shared/randomizer/world/scope-tables';
import { WORLD_EVENT_IDS } from '@shared/randomizer/world/events/story-events.data';
import { isShopSlotLocation } from '@shared/randomizer/world/shops/shop-slots';
import { capacityPondSpots, capacitySpots } from '@shared/randomizer/world/capacity/capacity-spots';
import { POND_INSTANCES } from '@shared/randomizer/world/pond/pond-instances';
import { POND_LOCATION_SET } from '@shared/randomizer/world/pond/pond-rungs';
import { ESCAPE_DARK_LOCATIONS, LAMP_LOCATIONS } from '@shared/randomizer/world/rules/tables/lamps.data';
import { BUNNY_ACCESSIBLE_LOCATIONS } from '@shared/randomizer/world/rules/tables/bunny-lists.data';
import { FULL_ACCESS_ALWAYS_ALLOW } from '@shared/randomizer/world/rules/tables/item-rules.data';
import { PRICED_ENTRIES } from '@shared/randomizer/world/rules/priced-entries';
import { GLOBAL_MISC_RULES } from '@shared/randomizer/world/rules/tables/global-misc.data';
import { DEFAULT_OVERWORLD_RULES } from '@shared/randomizer/world/rules/tables/default-overworld.data';
import { STANDARD_RULES } from '@shared/randomizer/world/rules/tables/standard.data';
import { LAMP_RULES } from '@shared/randomizer/world/rules/tables/lamps.data';
import { COMPLETION_RULES } from '@shared/randomizer/world/rules/tables/completion.data';
import { FIRST_CASTLE_RULES } from '@shared/randomizer/world/rules/tables/dungeon-first-castle.data';
import { CASTLE_TOWER_RULES } from '@shared/randomizer/world/rules/tables/dungeon-castle-tower.data';
import { EAST_PALACE_RULES } from '@shared/randomizer/world/rules/tables/dungeon-east-palace.data';
import { DESERT_PALACE_RULES } from '@shared/randomizer/world/rules/tables/dungeon-desert-palace.data';
import { MOUNTAIN_TOWER_RULES } from '@shared/randomizer/world/rules/tables/dungeon-mountain-tower.data';
import { DARK_PALACE_RULES } from '@shared/randomizer/world/rules/tables/dungeon-dark-palace.data';
import { SWAMP_RULES } from '@shared/randomizer/world/rules/tables/dungeon-swamp.data';
import { WOODS_RULES } from '@shared/randomizer/world/rules/tables/dungeon-woods.data';
import { THIEVES_DEN_RULES } from '@shared/randomizer/world/rules/tables/dungeon-thieves-den.data';
import { ICE_RULES } from '@shared/randomizer/world/rules/tables/dungeon-ice.data';
import { MIRE_RULES } from '@shared/randomizer/world/rules/tables/dungeon-mire.data';
import { TURTLE_RULES } from '@shared/randomizer/world/rules/tables/dungeon-turtle.data';
import { FINAL_TOWER_RULES } from '@shared/randomizer/world/rules/tables/dungeon-final-tower.data';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { RuleEntry } from '@shared/randomizer/world/rules/rule-entry.type';

/**
 * Every location the world can hold: the graph built with key drops on and every pond selling
 * its whole ladder, which is the widest set any option can open.
 */
const DECLARED: ReadonlySet<LocationKey> = new Set(buildWorld({
  ...normalWorldOptions({}),
  pondLocations: [...POND_LOCATION_SET, ...CAPACITY_UPGRADE_LOCATIONS.keys()],
}).locationsByKey.keys());

const isLocation = (key: string): boolean =>
  DECLARED.has(key as LocationKey) || isShopSlotLocation(key);

const notLocations = (keys: Iterable<string>): string[] => [...keys].filter((key) => !isLocation(key));

/** The story events of the world: never a location, and the only thing an event row may name. */
const STORY_EVENTS: ReadonlySet<string> = new Set(WORLD_EVENT_IDS);

const RULE_TABLES: Readonly<Record<string, readonly RuleEntry[]>> = {
  'global-misc': GLOBAL_MISC_RULES,
  'default-overworld': DEFAULT_OVERWORLD_RULES,
  standard: STANDARD_RULES,
  lamps: LAMP_RULES,
  completion: COMPLETION_RULES,
  'dungeon-first-castle': FIRST_CASTLE_RULES,
  'dungeon-castle-tower': CASTLE_TOWER_RULES,
  'dungeon-east-palace': EAST_PALACE_RULES,
  'dungeon-desert-palace': DESERT_PALACE_RULES,
  'dungeon-mountain-tower': MOUNTAIN_TOWER_RULES,
  'dungeon-dark-palace': DARK_PALACE_RULES,
  'dungeon-swamp': SWAMP_RULES,
  'dungeon-woods': WOODS_RULES,
  'dungeon-thieves-den': THIEVES_DEN_RULES,
  'dungeon-ice': ICE_RULES,
  'dungeon-mire': MIRE_RULES,
  'dungeon-turtle': TURTLE_RULES,
  'dungeon-final-tower': FINAL_TOWER_RULES,
};

const KEYED_TABLES: readonly (readonly [string, readonly string[]])[] = [
  ['scope-tables NPC_SCOPE_LOCATIONS', [...NPC_SCOPE_LOCATIONS.keys()]],
  ['scope-tables WORLD_ITEM_SCOPE_LOCATIONS', [...WORLD_ITEM_SCOPE_LOCATIONS.keys()]],
  ['scope-tables KEY_DROP_LOCATIONS', [...KEY_DROP_LOCATIONS.keys()]],
  ['scope-tables CAPACITY_UPGRADE_LOCATIONS', [...CAPACITY_UPGRADE_LOCATIONS.keys()]],
  ['scope-tables PRIZE_LOCATIONS', [...PRIZE_LOCATIONS]],
  ['scope-tables VANILLA_PRIZES', [...VANILLA_PRIZES.keys()]],
  ['capacity-spots capacitySpots', [...capacitySpots().values()]],
  ['capacity-spots capacityPondSpots', capacityPondSpots()],
  ['pond-instances slot locations', POND_INSTANCES.flatMap((pond) => pond.slots.map((slot) => slot.key))],
  ['pond-rungs POND_LOCATION_SET', [...POND_LOCATION_SET]],
  ['rules/tables lamps LAMP_LOCATIONS', LAMP_LOCATIONS],
  ['rules/tables lamps ESCAPE_DARK_LOCATIONS', ESCAPE_DARK_LOCATIONS],
  // The source exempts two story events alongside the locations; those two are events here.
  ['rules/tables bunny-lists', [...BUNNY_ACCESSIBLE_LOCATIONS].filter((key) => !STORY_EVENTS.has(key))],
  ['rules/tables item-rules FULL_ACCESS_ALWAYS_ALLOW', [...FULL_ACCESS_ALWAYS_ALLOW]],
  ['rules priced-entries PRICED_ENTRIES', PRICED_ENTRIES.filter((e) => e.kind === 'location').map((e) => e.target)],
  ...Object.entries(RULE_TABLES)
    .map(([label, table]): readonly [string, readonly string[]] =>
      [`rules/tables ${label}`, table.filter((entry) => entry.kind === 'location').map((entry) => entry.target)])
    // A table may rule only passages and events (the goal's own table does).
    .filter(([, keys]) => keys.length > 0),
];

/** The pond slots a setting invents, which exist as keys and never as records. */
const POND_SLOTS: ReadonlySet<LocationKey> = new Set([
  ...POND_LOCATION_SET, ...CAPACITY_UPGRADE_LOCATIONS.keys(),
]);

describe('every id-keyed table names a location the world really has', () => {
  for (const [label, keys] of KEYED_TABLES) {
    it(label, () => {
      expect(keys.length).toBeGreaterThan(0);
      expect(notLocations(keys)).toEqual([]);
    });
  }
});

describe('every event row names a story event of the world, never a location', () => {
  it('rule tables', () => {
    const events = Object.values(RULE_TABLES).flat().filter((entry) => entry.kind === 'event').map((entry) => entry.target);
    expect(events.length).toBeGreaterThan(0);
    expect(events.filter((key) => !STORY_EVENTS.has(key) || isLocation(key))).toEqual([]);
  });
});

describe('Normal fills the world it is built over', () => {
  it('fills every declared location, and only locations the world declares', () => {
    const filled = new Set(Object.keys(buildNormalPlacement().locations));
    expect([...filled].filter((key) => !isLocation(key))).toEqual([]);
    // A pond slot is a location only where a pond sells it, and Normal sells none.
    expect([...DECLARED].filter((key) => !filled.has(key) && !POND_SLOTS.has(key))).toEqual([]);
  });
});
