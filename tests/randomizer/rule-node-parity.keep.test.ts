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
 *
 * Re-captured a third time for another rename that moved no answer: the flute and floodgate
 * slots (check-011, check-025) became the story events they duplicated, "Weathervane opened"
 * (check-324) and "Floodgate lever pulled" (check-326). With those two keys mapped back, the
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
  'default': 'a5a759a3d11b79d22f09',
  'npc and world items off': 'b788f49b886f41c83f53',
  'key drop shuffle off': 'be2a1bd8606765a56f36',
  'capacity vanilla': '7ddae5cb5928294795af',
  'ponds at vanilla cost, shops open': '1ce0e8b4d2a3df6951fd',
  'dark rooms: lamp and fire rod refused': '975550de45a0d8c2fce4',
  'dark rooms: no light required': '8d62fd5c9de2cd1dd76e',
  'retro bow with shops': 'c0550dc5328fcc34636c',
  'story gates moved': 'ca98a127fc9ba0cd9e11',
  'item power and tiers': 'e287d04f84364e6397eb',
  'record of acts attached': 'b96a028cf2a449dce9df',
};

const GENERATION_SEEDS = Array.from({ length: 20 }, (_, index) => `rule-node-${index}`);

/** Captured from the closure-only engine, one per seed of GENERATION_SEEDS, default options. */
const PINNED_PLACEMENTS: readonly string[] = [
  '7600a29b2dcefb3a4484', 'd6f01b193eff6f1d1b2c', 'cc0c3ffd911ff3d6b5dd', '837be902a5a1c32d7ac5',
  '97d5068de0f15350b47b', '6c2ec73dca35b0bacedc', 'be632aacbb123e14ba51', '91799c7c1461e678812c',
  'f5d8e6ec1cf20c1a0ccb', '5b6f00e8f8cb9690da14', '8920078714a3ca432e21', '2d7181e380a624e999d2',
  '83bdffe57f5521597029', '12d7398eef5c8d752e37', '74460f1f07ab938c9fd7', '50a9cb90df6543edc9c9',
  '8455d33b44e8751eb60e', 'e277bbc9de072d2366b7', '18000150784c526637ae', '08bbc272aba7625a2fe9',
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
