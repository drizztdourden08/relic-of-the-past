/* @layer tests @kind helper */
import { buildOptionsSnapshot, generatePlacement } from '@rotp/randomizer';
import type { OptionValue, Placement } from '@rotp/randomizer';

const ANY_WORLD: Record<string, OptionValue> = {
  big_key_shuffle: 'any_world', small_key_shuffle: 'any_world', compass_shuffle: 'any_world', map_shuffle: 'any_world',
};

const ANY_ORDER: Record<string, OptionValue> = {
  progressive_mode_sword: 'random', progressive_mode_shield: 'random', progressive_mode_mail: 'random',
  progressive_mode_glove: 'random', progressive_mode_bow: 'random', progressive_mode_ocarina: 'random',
  progressive_tier_sword_3: false, progressive_tier_sword_4: false,
};

const SEED_REQUESTS: ReadonlyArray<{ name: string; seed: string; options: Record<string, OptionValue> }> = [
  { name: 'defaults', seed: 'golden-defaults', options: {} },
  { name: 'dungeon-items-any-world', seed: 'golden-any-world', options: ANY_WORLD },
  { name: 'progressive-any-order', seed: 'golden-progressive', options: ANY_ORDER },
  { name: 'dark-rooms-no-lamp', seed: 'golden-dark-rooms', options: { dark_room_light_lamp: false, dark_room_light_fire_rod: false } },
];

const goldenPlacement = (name: string): Placement => {
  const found = SEED_REQUESTS.find((request) => request.name === name);
  if (found === undefined) throw new Error(`unknown golden seed ${name}`);
  return generatePlacement({ seed: found.seed, snapshot: buildOptionsSnapshot(found.options) });
};

export { SEED_REQUESTS, goldenPlacement };
