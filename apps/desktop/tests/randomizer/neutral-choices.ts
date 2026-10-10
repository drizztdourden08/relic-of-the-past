/* @layer tests @kind constants */
import { DEFAULT_ACCESSIBILITY, DEFAULT_CAPACITY_BONUS, DEFAULT_DARK_ROOM_SETTING, DEFAULT_DUNGEON_ITEM_SETTING, DEFAULT_STORY_GATES, defaultDifficulty, defaultProgressiveModes } from '@rotp/randomizer';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';

type NeutralField =
  | 'bigKeyShuffle' | 'smallKeyShuffle' | 'compassShuffle' | 'mapShuffle'
  | 'capacityBonus' | 'progressiveModes' | 'difficulty' | 'storyGates' | 'accessibility'
  | 'darkRoomLightRequired' | 'darkRoomLightLamp' | 'darkRoomLightFireRod' | 'darkRoomLightBombos' | 'darkRoomLightRedCane';

const NEUTRAL_CHOICES: Pick<RandomizerOptionChoices, NeutralField> = {
  bigKeyShuffle: DEFAULT_DUNGEON_ITEM_SETTING.bigKey,
  smallKeyShuffle: DEFAULT_DUNGEON_ITEM_SETTING.smallKey,
  compassShuffle: DEFAULT_DUNGEON_ITEM_SETTING.compass,
  mapShuffle: DEFAULT_DUNGEON_ITEM_SETTING.map,
  capacityBonus: DEFAULT_CAPACITY_BONUS,
  progressiveModes: defaultProgressiveModes(),
  difficulty: defaultDifficulty(),
  storyGates: DEFAULT_STORY_GATES,
  accessibility: DEFAULT_ACCESSIBILITY,
  darkRoomLightRequired: DEFAULT_DARK_ROOM_SETTING.requireLight,
  darkRoomLightLamp: DEFAULT_DARK_ROOM_SETTING.lights.lamp,
  darkRoomLightFireRod: DEFAULT_DARK_ROOM_SETTING.lights.fireRod,
  darkRoomLightBombos: DEFAULT_DARK_ROOM_SETTING.lights.bombos,
  darkRoomLightRedCane: DEFAULT_DARK_ROOM_SETTING.lights.redCane,
};

export { NEUTRAL_CHOICES };
