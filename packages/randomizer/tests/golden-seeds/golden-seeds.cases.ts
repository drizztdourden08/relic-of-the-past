/* @layer tests @kind constants */
import { SHOP_MODE_KEY, SHOP_SLOT_ROWS, buildOptionsSnapshot } from '@rotp/randomizer';
import type { OptionValue } from '@rotp/randomizer';
import { NPC_AND_WORLD_SPOTS, POND_SPOTS_ONLY } from './golden-seeds.deliverable';
import type { GoldenCase } from './golden-seeds.type';

const EVERY_SHOP_SLOT: Record<string, OptionValue> = Object.fromEntries(SHOP_SLOT_ROWS.map((row) => [row.key, true]));

const dungeonItems = (mode: string): Record<string, OptionValue> => ({
  big_key_shuffle: mode, small_key_shuffle: mode, compass_shuffle: mode, map_shuffle: mode,
});

const GOLDEN_CASES: readonly GoldenCase[] = [
  { name: 'defaults', request: { seed: 'golden-defaults', snapshot: buildOptionsSnapshot({}) } },
  {
    name: 'key-drop-shuffle',
    request: {
      seed: 'golden-key-drops',
      snapshot: buildOptionsSnapshot({ key_drop_shuffle: true, include_npc_checks: true, include_world_items: true }),
      deliverable: NPC_AND_WORLD_SPOTS,
    },
  },
  {
    name: 'prizes-vanilla',
    request: { seed: 'golden-prizes', snapshot: buildOptionsSnapshot({ dungeon_prize_shuffle: false }) },
  },
  {
    name: 'dungeon-items-own-dungeons',
    request: { seed: 'golden-own-dungeons', snapshot: buildOptionsSnapshot(dungeonItems('own_dungeons')) },
  },
  {
    name: 'dungeon-items-own-world',
    request: { seed: 'golden-own-world', snapshot: buildOptionsSnapshot(dungeonItems('own_world')) },
  },
  {
    name: 'dungeon-items-any-world',
    request: { seed: 'golden-any-world', snapshot: buildOptionsSnapshot(dungeonItems('any_world')) },
  },
  {
    name: 'dungeon-items-different-world',
    request: { seed: 'golden-different-world', snapshot: buildOptionsSnapshot(dungeonItems('different_world')) },
  },
  {
    name: 'dungeon-items-start-with',
    request: { seed: 'golden-start-with', snapshot: buildOptionsSnapshot(dungeonItems('start_with')) },
  },
  {
    name: 'dungeon-items-universal-keys',
    request: {
      seed: 'golden-universal',
      snapshot: buildOptionsSnapshot({ small_key_shuffle: 'universal', big_key_shuffle: 'any_world' }),
    },
  },
  {
    name: 'accessibility-minimal',
    request: { seed: 'golden-minimal', snapshot: buildOptionsSnapshot({ accessibility: 'minimal' }) },
  },
  {
    name: 'retro-bow',
    request: { seed: 'golden-retro', snapshot: buildOptionsSnapshot({ retro_bow: true, shop_item_slots: 6 }) },
  },
  {
    name: 'progressive-any-order',
    request: {
      seed: 'golden-progressive',
      snapshot: buildOptionsSnapshot({
        progressive_mode_sword: 'random', progressive_mode_shield: 'random', progressive_mode_mail: 'random',
        progressive_mode_glove: 'random', progressive_mode_bow: 'random', progressive_mode_ocarina: 'random',
        progressive_tier_sword_3: false, progressive_tier_sword_4: false,
      }),
    },
  },
  {
    name: 'capacity-and-ponds',
    request: {
      seed: 'golden-ponds',
      snapshot: buildOptionsSnapshot({
        capacity_explosives_mode: 'custom', capacity_projectiles_mode: 'custom',
        pond_capacity_mode: 'custom', pond_capacity_items: 4, pond_capacity_throws: 6,
        pond_capacity_ask_rupees_min: '25', pond_capacity_ask_rupees_max: '300',
        pond_wishing_mode: 'capacity', pond_cursed_mode: 'vanilla-cost', pond_cursed_items: 2,
      }),
      deliverable: POND_SPOTS_ONLY,
    },
  },
  {
    name: 'shops-every-slot',
    request: {
      seed: 'golden-shops',
      snapshot: buildOptionsSnapshot({ ...EVERY_SHOP_SLOT, [SHOP_MODE_KEY]: 'custom', shop_slot_depth: 2 }),
    },
  },
  {
    name: 'story-gates-moved',
    request: {
      seed: 'golden-story-gates',
      snapshot: buildOptionsSnapshot({
        story_pedestal_gate: 'anyThreeDungeons', story_sahasrahla_gate: 'easternPalace',
        story_barrier_gate: 'pedestal', story_bomb_shop_gate: 'towerCount',
        story_tower_count_kind: 'darkWorldDungeons', crystals_needed_for_gt: 4, crystals_needed_for_ganon: 0,
      }),
    },
  },
  {
    name: 'dark-rooms-no-lamp',
    request: {
      seed: 'golden-dark-rooms',
      snapshot: buildOptionsSnapshot({ dark_room_light_lamp: false, dark_room_light_fire_rod: false }),
    },
  },
  {
    name: 'retry-candidate-tight-pool',
    request: {
      seed: 'golden-retry',
      snapshot: buildOptionsSnapshot({
        key_drop_shuffle: true, include_npc_checks: true, include_world_items: true, ...dungeonItems('any_world'),
      }),
      deliverable: NPC_AND_WORLD_SPOTS,
    },
  },
];

export { GOLDEN_CASES };
