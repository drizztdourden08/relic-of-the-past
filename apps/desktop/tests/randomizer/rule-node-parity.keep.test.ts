/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { generateFromSnapshot, primitiveHelperNames } from '@rotp/randomizer';
import { exportParity, placementDigest, ruleDigest, snapshotOf } from './rule-parity-harness';
import type { OptionValue } from '@rotp/randomizer';

const STATES = 5000;

interface ParityCase {
  name: string;
  over: Record<string, OptionValue>;
  actRecord?: boolean;
}

const CASES: readonly ParityCase[] = [
  { name: 'default', over: {} },
  { name: 'npc and world items off', over: { include_npc_checks: false, include_world_items: false } },
  { name: 'key drop shuffle off', over: { key_drop_shuffle: false } },
  {
    name: 'capacity vanilla',
    over: {
      capacity_explosives_mode: 'vanilla', capacity_projectiles_mode: 'vanilla',
      capacity_meter_mode: 'vanilla', capacity_wallet_mode: 'vanilla', pond_capacity_mode: 'capacity',
    },
  },
  {
    name: 'ponds at vanilla cost, shops open',
    over: {
      pond_capacity_mode: 'capacity', pond_wishing_mode: 'vanilla-cost', pond_cursed_mode: 'vanilla-cost',
      shop_item_slots: 12,
    },
  },
  { name: 'dark rooms: lamp and fire rod refused', over: { dark_room_light_lamp: false, dark_room_light_fire_rod: false } },
  { name: 'dark rooms: no light required', over: { dark_room_light_required: false } },
  { name: 'retro bow with shops', over: { retro_bow: true, shop_item_slots: 6 } },
  {
    name: 'story gates moved',
    over: {
      story_pedestal_gate: 'anyThreeDungeons', story_sahasrahla_gate: 'easternPalace',
      story_barrier_gate: 'pedestal', story_bomb_shop_gate: 'towerCount',
      story_tower_count_kind: 'darkWorldDungeons', crystals_needed_for_gt: 4, crystals_needed_for_ganon: 0,
    },
  },
  {
    name: 'item power and tiers',
    over: {
      progressive_tier_sword_3: false, progressive_tier_sword_4: false, item_power_hammer_tablets: true,
      item_power_curtains_pullable: true, big_key_shuffle: 'any_world', small_key_shuffle: 'any_world',
    },
  },
  { name: 'record of acts attached', over: {}, actRecord: true },
];

const PINNED_RULES: Readonly<Record<string, string>> = {
  'default': '35a0ed0e720941258942',
  'npc and world items off': '7a9220d1cb55a426f7c1',
  'key drop shuffle off': '0318950cd932669abbae',
  'capacity vanilla': 'adebf9a70ec8416609e2',
  'ponds at vanilla cost, shops open': '6a98c22d955bdb7605e1',
  'dark rooms: lamp and fire rod refused': 'af896962764fd9d694e7',
  'dark rooms: no light required': 'b738cae95b4c92a100db',
  'retro bow with shops': '9f3239c942cec515597d',
  'story gates moved': '61fde2006d3bb6c13c64',
  'item power and tiers': '596aea8c4d63eb094d14',
  'record of acts attached': '53b36023d659e9470391',
};

const GENERATION_SEEDS = Array.from({ length: 20 }, (_, index) => `rule-node-${index}`);

const PINNED_PLACEMENTS: readonly string[] = [
  'a6412448c4a7b50f6176', '5b17132dbdddf7e4a459', '8e7d80ae6694b327423b', '1b966a4b8288afb5fdb2',
  '11d8e648e0149df0ecee', '2c973fcbc08329e5d1ab', '52a9434d9254547ebcad', 'c048f5249da36765701c',
  'f0c842a4e3d80be67f04', 'f0566f32157061433dd4', '06a600818938d68c8ba0', 'a3446d4e009711114455',
  '51118e704198f1b0e6cc', '470d692901525326b87f', '06f154682cb394ff025d', 'c9bb2e92484a1f29ad94',
  'fa62e5e7f1a0a24622eb', 'dd2cc64507ffb3706790', 'a36a4cac4eb06ad07bae', '5763ab90f3f651cf7a91',
];

describe('rule answers match the closure-only engine', () => {
  for (const parityCase of CASES) {
    it(parityCase.name, () => {
      const { digest, trues } = ruleDigest(parityCase.over, STATES, parityCase.actRecord);
      expect(trues).toBeGreaterThan(0);
      if (PINNED_RULES[parityCase.name] === undefined) console.log(`RULES ${parityCase.name}: ${digest}`);
      expect(digest).toBe(PINNED_RULES[parityCase.name]);
    }, 600_000);
  }
});

const EXPORT_STATES = 1000;
const PRIMITIVES = [
  'canExtendMagic', 'explosivesAtLeast', 'hasHearts', 'heartCapacityAbove', 'projectilesAtLeast', 'walletAtLeast',
];

describe('exported trees answer as the engine does', () => {
  it('keeps the primitive helper list short and fixed', () => {
    expect(primitiveHelperNames().sort()).toEqual(PRIMITIVES);
  });
  for (const parityCase of CASES) {
    it(parityCase.name, () => {
      const { asked, mismatches, residualCalls } = exportParity(parityCase.over, EXPORT_STATES, parityCase.actRecord);
      expect(asked).toBeGreaterThan(0);
      expect(mismatches).toEqual([]);
      expect(residualCalls.every((name) => PRIMITIVES.includes(name)), residualCalls.join(' ')).toBe(true);
    }, 600_000);
  }
});

describe('generation matches the closure-only engine', () => {
  it('places the same items for 20 seeds', () => {
    const digests = GENERATION_SEEDS.map((seed) => placementDigest(generateFromSnapshot({ seed, snapshot: snapshotOf({}) })));
    if (PINNED_PLACEMENTS.length === 0) console.log(`PLACEMENTS ${JSON.stringify(digests)}`);
    expect(digests).toEqual(PINNED_PLACEMENTS);
  }, 600_000);
});
