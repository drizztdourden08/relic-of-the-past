/* @layer tests @kind test */
/**
 * Guard: the rules answer exactly as they did before they became data trees.
 *
 * Every rule of the randomizer is a node tree now (world/rules/rule-node.type.ts), compiled
 * into the closure the engine calls. The digests below were captured from the closure-only
 * engine BEFORE that rewrite: every location rule and every exit rule, asked over 5000 seeded
 * random collection states per option set (rule-parity-harness.ts). A rewrite that changes one
 * answer anywhere moves a digest. The generation half pins whole placements for 20 seeds, so
 * the fill reads the same rules the same way too.
 *
 * A digest moves ON PURPOSE only when a rule is meant to change; re-capture it then, in the
 * same change, and say which rule moved.
 *
 * Re-captured once for a rename that moved no answer: the five event slots keyed by item-check
 * ids (check-097, 098, 099, 081, 082) became the ledger's event records (check-351, 329, 349,
 * 335, 336). The old engine's output with those keys mapped hashed to exactly these digests.
 *
 * Re-captured a second time for another rename that moved no answer: every shop purchase is
 * keyed `<shop>-shelf_<side>-slot_<n>` instead of by its shelf's check id (`check-638`) and a
 * restock key (`slot-check-638-2`). With every new shop key mapped back to its old key, the
 * engine hashes to exactly the previous digests, for every rule case and all 20 seeds.
 */
import { describe, expect, it } from 'vitest';
import { generateFromSnapshot } from '@shared/randomizer/generate';
import { primitiveHelperNames } from '@shared/randomizer/world/rules/helpers-registry';
import { placementDigest, ruleDigest, snapshotOf } from './rule-parity-harness';
import { exportParity } from './rule-export-harness';
import type { OptionValue } from '@shared/randomizer/world/options.type';

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

/** Captured from the closure-only engine, before any rule became a node tree. */
const PINNED_RULES: Readonly<Record<string, string>> = {
  'default': 'dbfd00812071aacf3deb',
  'npc and world items off': '289866c566ab8d95aa3e',
  'key drop shuffle off': '73cb57c6a39eaa3c07e1',
  'capacity vanilla': 'cf37b33f7992a1d2d1d3',
  'ponds at vanilla cost, shops open': '4188992d2d2e8c6aa51f',
  'dark rooms: lamp and fire rod refused': 'e31709814ea47907f9d6',
  'dark rooms: no light required': 'f02d6114f30d3694d30b',
  'retro bow with shops': 'ef9d4c4306f7031a467f',
  'story gates moved': '7c97e7613855c60ad14b',
  'item power and tiers': '44503899162309809a7e',
  'record of acts attached': '214802a370e8dd9925a6',
};

const GENERATION_SEEDS = Array.from({ length: 20 }, (_, index) => `rule-node-${index}`);

/** Captured from the closure-only engine, one per seed of GENERATION_SEEDS, default options. */
const PINNED_PLACEMENTS: readonly string[] = [
  '4391a1223ae2832679b2', '0e16ef3d0f2087d4f28a', '90d071a131703e536442', 'd87e3c608ef4aad54cbc',
  '5c85b7e02734afde978b', '9e85f57cb92dfb1567fd', '227c54897a5e4178f97d', '864a34e987ae33b6089b',
  '3bc69fb78eaec9daaefe', 'd447e2be1fb1b76d31ce', '4592b57fa5ad40799d15', '291d310acd54e13b3bf3',
  'd66b17740b5eb4b600e8', '08d6e9b2898a29d10487', '8f1e7f35925785a5330c', '5fb69f6ad77c6384f161',
  '2ce42357cf7ecab9e13c', 'db8851022c7a7175a379', 'ddab64c43b091287528f', '6fb82a1b99d02341e586',
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

/**
 * The export half: each world's trees, inlined down to primitive ops and sent through JSON, answer
 * as the engine does, and name no helper outside the primitive list another implementation writes.
 */
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
      const { asked, mismatches, leftHelpers } = exportParity(parityCase.over, EXPORT_STATES, parityCase.actRecord);
      expect(asked).toBeGreaterThan(0);
      expect(mismatches).toEqual([]);
      expect(leftHelpers.every((name) => PRIMITIVES.includes(name)), leftHelpers.join(' ')).toBe(true);
    }, 600_000);
  }
});

describe('generation matches the closure-only engine', () => {
  it('places the same items for 20 seeds', () => {
    const digests = GENERATION_SEEDS.map((seed) => placementDigest(generateFromSnapshot(seed, snapshotOf({}))));
    if (PINNED_PLACEMENTS.length === 0) console.log(`PLACEMENTS ${JSON.stringify(digests)}`);
    expect(digests).toEqual(PINNED_PLACEMENTS);
  }, 600_000);
});
