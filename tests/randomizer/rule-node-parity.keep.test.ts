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
 *
 * Re-captured a fourth time when the event pairs became story events of the world: the eight
 * event locations and their event items are gone, the sweep grants each story event where it
 * happens, and a rule asks for it by its check id. The capacity shop's token is gone too; a
 * vanilla bomb or arrow family reads the fairy's room and her price directly. With every old
 * event item read as its check id and the old event locations left out of both runs, the rules
 * answered exactly alike over the same random states for every case but "capacity vanilla",
 * whose random states could hold the shop token without reaching the shop. Generation did not
 * move: every seed placed the same item on every location, sphere for sphere, in all five
 * option sets measured (capacity vanilla among them) and in all 20 seeds below; the placement
 * digests moved only because the event rows left the placement. From this capture on, the rule
 * digests also ask every story event's own rule.
 *
 * Re-captured a fifth time when the Activated Flute (item-075) became an ordinary item with its
 * own handle, so the random states now draw it too. No rule changed (the bird already came to
 * it); with item-075 left out of the random states the old digests matched in every case, and
 * all 20 seeds held.
 *
 * Re-captured a sixth time when the Flute became the Progressive Ocarina family (item-179): the
 * pool carries the family item in the Flute's place, and a snapshot now holds the family's two
 * tier rows. The rules did not move: with item-179 left out of the random states, every case
 * hashed to the fifth capture. The placements moved because the pool's item and the snapshot did.
 *
 * Re-captured a seventh time when the placement stats dropped `capacityShuffle`, a field only
 * older placements were read by. With that field put back in its place, all 20 seeds hashed to
 * the sixth capture; the rules were not touched.
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

/** Captured from the closure-only engine, one per seed of GENERATION_SEEDS, default options. */
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
