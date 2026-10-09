/* @layer renderer-components @kind constants */
import { DEFAULT_CAPACITY_BONUS, DEFAULT_CAPACITY_PROFILE } from '@rotp/randomizer';
import { DEFAULT_POND_PROFILES } from '@rotp/randomizer';
import { defaultShopScope } from '@rotp/randomizer';
import { DEFAULT_DARK_ROOM_SETTING } from '@rotp/randomizer';
import { defaultDifficulty } from '@rotp/randomizer';
import { DEFAULT_ITEM_POWER } from '@rotp/randomizer';
import { defaultProgressiveSetting } from '@rotp/randomizer';
import { defaultProgressiveModes } from '@rotp/randomizer';
import { defaultRetroBow } from '@rotp/randomizer';
import { DEFAULT_ACCESSIBILITY } from '@rotp/randomizer';
import { INCLUDE_NPC_CHECKS_KEY, INCLUDE_WORLD_ITEMS_KEY } from '@rotp/randomizer';
import { DEFAULT_DUNGEON_ITEM_SETTING } from '@rotp/randomizer';
import { DEFAULT_STORY_GATES } from '@rotp/randomizer';
import { EMPTY_SERVER_SETUP } from '@app/hooks/randomizer/server-setup/server-setup-draft';
import { baselineSwitch } from './baseline-switch';
import type { RandomizerFormState } from './build-randomizer-config.type';

const EMPTY_RANDOMIZER_FORM: RandomizerFormState = {
  enabled: false, seed: '', mode: 'local', server: EMPTY_SERVER_SETUP, deathLink: false,
  trackOtherPlayers: true,
  keyDropShuffle: baselineSwitch('key_drop_shuffle'),
  includeNpcChecks: baselineSwitch(INCLUDE_NPC_CHECKS_KEY),
  includeWorldItems: baselineSwitch(INCLUDE_WORLD_ITEMS_KEY),
  shufflePrizes: baselineSwitch('dungeon_prize_shuffle'),
  bigKeyShuffle: DEFAULT_DUNGEON_ITEM_SETTING.bigKey,
  smallKeyShuffle: DEFAULT_DUNGEON_ITEM_SETTING.smallKey,
  compassShuffle: DEFAULT_DUNGEON_ITEM_SETTING.compass,
  mapShuffle: DEFAULT_DUNGEON_ITEM_SETTING.map,
  shops: defaultShopScope(), shopPrices: {},
  capacityEnabled: true,
  capacity: DEFAULT_CAPACITY_PROFILE,
  capacityProgressive: true,
  capacityBonus: DEFAULT_CAPACITY_BONUS,
  ponds: DEFAULT_POND_PROFILES,
  progressiveTiers: defaultProgressiveSetting(),
  progressiveModes: defaultProgressiveModes(),
  retroBow: defaultRetroBow(),
  itemPower: DEFAULT_ITEM_POWER,
  storyGates: DEFAULT_STORY_GATES,
  difficulty: defaultDifficulty(),
  accessibility: DEFAULT_ACCESSIBILITY,
  darkRoomLightRequired: DEFAULT_DARK_ROOM_SETTING.requireLight,
  darkRoomLightLamp: DEFAULT_DARK_ROOM_SETTING.lights.lamp,
  darkRoomLightFireRod: DEFAULT_DARK_ROOM_SETTING.lights.fireRod,
  darkRoomLightBombos: DEFAULT_DARK_ROOM_SETTING.lights.bombos,
  darkRoomLightRedCane: DEFAULT_DARK_ROOM_SETTING.lights.redCane,
};

const NO_SEED_ERROR = 'The randomizer needs a seed. Type one, or keep the one thrown for you.';

export { EMPTY_RANDOMIZER_FORM, NO_SEED_ERROR };
