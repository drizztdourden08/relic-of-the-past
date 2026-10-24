/* @layer shared-game @kind types */
import type { RuleNode, RuleOptionKey, RuleOptionValue } from '../../world/rules/rule-node.type';
import type { SeedValue } from '../../world/world.type';
import type { OptionValue } from '../../world/options.type';
import type { FillWorld } from '../../world/fill/fill-world.type';
import type { LocationKey } from '../../world/location-key';

type LocationRequires = { always: true } | { present: 'pond' | 'shop' };

interface ExportedLocation {
  key: string;
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
  classification: ItemClass;
}

interface ExportedHelperCall {
  name: string;
  args: readonly (number | string | boolean)[];
  rule: RuleNode;
}

interface ExportedRules {
  primitives: Record<string, readonly string[]>;
  helpers: ExportedHelperCall[];
}

type OptionType = 'toggle' | 'choice' | 'range' | 'text' | 'dict';

interface ExportedOption {
  key: string;
  type: OptionType;
  displayName: string;
  description: string;
  default: OptionValue | Record<string, never>;
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
  jumpItems: readonly string[];
  progressiveItem: string;
  planJumps: readonly number[];
}

interface PrimitiveData {
  families: Record<'explosives' | 'projectiles' | 'meter' | 'wallet', CapacityFamilyData>;
  capacityShop: { region: string; price: number };
  meterHalf: string;
  meterQuarter: string;
  meterItems: readonly string[];
  bottles: readonly string[];
  bottleLimit: number;
  hearts: {
    container: string; sanctuary: string; piece: string;
    start: number; containerCap: number; pieceCap: number;
  };
  potionSeller: string;
}

type WorldExport = Record<string, unknown>;

interface WorldModel {
  options: Record<string, OptionValue>;
  present: string[];
  locked: Record<string, string>;
  prizes: { shuffle: boolean; vanilla: Record<string, string>; items: string[] };
  pool: Record<string, number>;
  dungeonItems: { item: string; dungeon: string | null; rank: number }[];
  locationDungeon: Record<string, string>;
  classes: Record<string, ItemClass>;
  readings: Record<RuleOptionKey, RuleOptionValue>;
  seedValues: Record<string, SeedValue>;
  tiers: Record<string, readonly string[]>;
  primitives: PrimitiveData;
  forbidden: Record<string, string[]>;
  fillerItem: string;
}

interface WorldModelInput {
  fillWorld: FillWorld;
  options: Record<string, OptionValue>;
  shufflePrizes: boolean;
}

type ItemHalf = Pick<WorldModel, 'pool' | 'dungeonItems' | 'classes' | 'forbidden' | 'fillerItem'>;

interface ItemHalfInput {
  fillWorld: FillWorld;
  fillable: readonly LocationKey[];
  fixedProgression: ReadonlySet<string>;
  read: ReadonlySet<string>;
  locked: Iterable<string>;
}

interface Readings {
  option: (key: string) => string | number | boolean;
  seed: (key: string) => string | number | boolean;
}

type HelperNode = Extract<RuleNode, { op: 'helper' }>;

export type {
  CapacityFamilyData, ExportedEvent, ExportedExit, ExportedHelperCall, ExportedItem, ExportedLocation, ExportedOption,
  ExportedRegions, ExportedRules, HelperNode, ItemClass, ItemHalf, ItemHalfInput, LocationRequires, OptionType,
  PrimitiveData, Readings, WorldExport, WorldModel, WorldModelInput,
};
