/* @layer shared-game @kind constants */
import { optionChoices } from './option-choices';

const ENEMY_TIER_CHOICES = optionChoices(['easy', 0], ['default', 1], ['hard', 2], ['expert', 3]);

const DUNGEON_ITEM_CHOICES = optionChoices(
  ['original_dungeon', 0], ['own_dungeons', 1], ['own_world', 2],
  ['any_world', 3], ['different_world', 4], ['start_with', 6],
);

const SMALL_KEY_CHOICES = optionChoices(
  ['original_dungeon', 0], ['own_dungeons', 1], ['own_world', 2],
  ['any_world', 3], ['different_world', 4], ['universal', 5], ['start_with', 6],
);

const MEDALLION_CHOICES = optionChoices(['random', 'random'], ['ether', 0], ['bombos', 1], ['quake', 2]);

export { DUNGEON_ITEM_CHOICES, ENEMY_TIER_CHOICES, MEDALLION_CHOICES, SMALL_KEY_CHOICES };
