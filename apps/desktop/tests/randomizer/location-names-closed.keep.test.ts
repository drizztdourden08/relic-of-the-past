/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { buildNormalPlacement, normalWorldOptions, buildWorld, CAPACITY_UPGRADE_LOCATIONS, KEY_DROP_LOCATIONS, NPC_SCOPE_LOCATIONS, PRIZE_LOCATIONS, VANILLA_PRIZES, WORLD_ITEM_SCOPE_LOCATIONS, WORLD_EVENT_IDS, isShopSlotLocation, capacityPondSpots, capacitySpots, POND_INSTANCES, POND_LOCATION_SET, ESCAPE_DARK_LOCATIONS, LAMP_LOCATIONS, BUNNY_ACCESSIBLE_LOCATIONS, FULL_ACCESS_ALWAYS_ALLOW, PRICED_ENTRIES, GLOBAL_MISC_RULES, DEFAULT_OVERWORLD_RULES, STANDARD_RULES, LAMP_RULES, COMPLETION_RULES, FIRST_CASTLE_RULES, CASTLE_TOWER_RULES, EAST_PALACE_RULES, DESERT_PALACE_RULES, MOUNTAIN_TOWER_RULES, DARK_PALACE_RULES, SWAMP_RULES, WOODS_RULES, THIEVES_DEN_RULES, ICE_RULES, MIRE_RULES, TURTLE_RULES, FINAL_TOWER_RULES } from '@rotp/randomizer';
import type { LocationKey, RuleEntry } from '@rotp/randomizer';

const DECLARED: ReadonlySet<LocationKey> = new Set(buildWorld({
  ...normalWorldOptions({}),
  pondLocations: [...POND_LOCATION_SET, ...CAPACITY_UPGRADE_LOCATIONS.keys()],
}).locationsByKey.keys());

const isLocation = (key: string): boolean =>
  DECLARED.has(key as LocationKey) || isShopSlotLocation(key);

const notLocations = (keys: Iterable<string>): string[] => [...keys].filter((key) => !isLocation(key));

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
  ['rules/tables bunny-lists', [...BUNNY_ACCESSIBLE_LOCATIONS].filter((key) => !STORY_EVENTS.has(key))],
  ['rules/tables item-rules FULL_ACCESS_ALWAYS_ALLOW', [...FULL_ACCESS_ALWAYS_ALLOW]],
  ['rules priced-entries PRICED_ENTRIES', PRICED_ENTRIES.filter((e) => e.kind === 'location').map((e) => e.target)],
  ...Object.entries(RULE_TABLES)
    .map(([label, table]): readonly [string, readonly string[]] =>
      [`rules/tables ${label}`, table.filter((entry) => entry.kind === 'location').map((entry) => entry.target)])
    .filter(([, keys]) => keys.length > 0),
];

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
    expect([...DECLARED].filter((key) => !filled.has(key) && !POND_SLOTS.has(key))).toEqual([]);
  });
});
