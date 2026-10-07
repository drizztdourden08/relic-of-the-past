/* @layer shared-game @kind types */
/**
 * The JSON the world package is built from (integrations/archipelago/README.md describes each
 * file). The rule trees are the engine's own RuleNode trees, unchanged; everything that one
 * profile settles (which locations exist, the pool, the readings, the seed table) travels as a
 * WorldModel, written into the player file under `pre_rolled.world`.
 */
import type { RuleNode, RuleOptionKey, RuleOptionValue } from '../../world/rules/rule-node.type';
import type { SeedValue } from '../../world/world.type';
import type { OptionValue } from '../../world/options.type';

/** When a location exists: always, or only while the profile's world model lists it. */
type LocationRequires = { always: true } | { present: 'pond' | 'shop' };

interface ExportedLocation {
  key: string;
  /** Archipelago's numeric id. */
  id: number;
  name: string;
  region: string;
  prize: boolean;
  requires: LocationRequires;
  rule: RuleNode;
}

interface ExportedExit {
  name: string;
  from: string;
  to: string;
  rule: RuleNode;
}

/**
 * A story event of the world: the loader creates it at generation time as an Archipelago event
 * (a location and an item, both with no id, under the event's own name) in its region.
 */
interface ExportedEvent {
  key: string;
  name: string;
  region: string;
  rule: RuleNode;
}

interface ExportedRegions {
  start: string;
  regions: { id: string; name: string }[];
  exits: ExportedExit[];
  events: ExportedEvent[];
}

type ItemClass = 'progression' | 'progression_skip_balancing' | 'useful' | 'filler';

interface ExportedItem {
  key: string;
  id: number;
  name: string;
  /** What the pool itself calls the item under the default options. */
  classification: ItemClass;
}

interface ExportedHelper {
  name: string;
  args: readonly (number | string | boolean)[];
  rule: RuleNode;
}

interface ExportedRules {
  /** The helpers the loader implements itself, with their parameter names. */
  primitives: Record<string, readonly string[]>;
  /** Every derived helper call the trees make, with the tree it stands for. */
  helpers: ExportedHelper[];
}

type OptionType = 'toggle' | 'choice' | 'range' | 'text' | 'dict';

interface ExportedOption {
  key: string;
  type: OptionType;
  displayName: string;
  description: string;
  default: OptionValue | Record<string, never>;
  /** Choice rows: the app's value, the numeric id Archipelago stores, and whether it is a number. */
  choices?: { value: string; id: number }[];
  numeric?: boolean;
  range?: { min: number; max: number };
  locked: boolean;
}

interface CapacityFamilyData {
  mode: string;
  ladder: readonly number[];
  vanillaRung: number;
  startTier: number;
  /** jumpItems[j - 1] is the item that climbs j rungs. */
  jumpItems: readonly string[];
  progressiveItem: string;
  planJumps: readonly number[];
}

interface PrimitiveData {
  families: Record<'explosives' | 'projectiles' | 'meter' | 'wallet', CapacityFamilyData>;
  /** The capacity fairy's room and price: a vanilla bomb or arrow family tops out there. */
  capacityShop: { region: string; price: number };
  meterHalf: string;
  meterQuarter: string;
  /** Items every use of which spends the meter: unusable on the meter's empty rung. */
  meterItems: readonly string[];
  bottles: readonly string[];
  bottleLimit: number;
  hearts: {
    container: string; sanctuary: string; piece: string;
    start: number; containerCap: number; pieceCap: number;
  };
  potionSeller: string;
}

/** Everything one profile's world settles, keyed by location and item keys. */
interface WorldModel {
  options: Record<string, OptionValue>;
  present: string[];
  locked: Record<string, string>;
  prizes: { shuffle: boolean; vanilla: Record<string, string>; items: string[] };
  pool: Record<string, number>;
  /**
   * Items placed inside the dungeons before the main fill; `dungeon` set pins one to its own.
   * `rank` orders the placement: the fill takes the highest rank first (fill/dungeon-fill.ts).
   */
  dungeonItems: { item: string; dungeon: string | null; rank: number }[];
  /** Every dungeon location, with the dungeon that owns it. */
  locationDungeon: Record<string, string>;
  classes: Record<string, ItemClass>;
  readings: Record<RuleOptionKey, RuleOptionValue>;
  seedValues: Record<string, SeedValue>;
  tiers: Record<string, readonly string[]>;
  primitives: PrimitiveData;
  forbidden: Record<string, string[]>;
  fillerItem: string;
}

export type {
  CapacityFamilyData, ExportedEvent, ExportedExit, ExportedHelper, ExportedItem, ExportedLocation, ExportedOption,
  ExportedRegions, ExportedRules, ItemClass, LocationRequires, OptionType, PrimitiveData, WorldModel,
};
