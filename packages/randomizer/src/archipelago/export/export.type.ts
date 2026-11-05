/* @layer shared-game @kind types */
import type { RuleNode, RuleOptionKey, RuleOptionValue } from '../../world/rules/rule-node.type';
import type { SeedValue } from '../../world/world.type';
import type { OptionValue } from '../../world/options.type';
import type { FillWorld } from '../../world/fill/fill-world.type';
import type { LocationKey } from '../../world/location-key';

type ItemClass = 'progression' | 'progression_skip_balancing' | 'useful' | 'filler';

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
  CapacityFamilyData, HelperNode, ItemClass, ItemHalf, ItemHalfInput, PrimitiveData, Readings, WorldModel, WorldModelInput,
};
