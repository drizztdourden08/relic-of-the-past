/* @layer renderer-components @kind constants */
import { DEFAULT_CAPACITY_BONUS, DEFAULT_CAPACITY_PROFILE } from '@shared/randomizer/world/capacity';
import { DEFAULT_POND_PROFILES } from '@shared/randomizer/world/pond/pond-profile-defaults';
import { defaultShopScope } from '@shared/randomizer/world/shops/shop-scope-from-values';
import { DEFAULT_DARK_ROOM_SETTING } from '@shared/randomizer/world/dark-rooms/dark-room-lights.data';
import { defaultDifficulty } from '@shared/randomizer/world/difficulty/difficulty-from-snapshot';
import { DEFAULT_ITEM_POWER } from '@shared/randomizer/world/item-power/item-power.data';
import { defaultProgressiveSetting } from '@shared/randomizer/world/progressive/progressive-from-snapshot';
import { defaultProgressiveModes } from '@shared/randomizer/world/progressive/progressive-modes.data';
import { defaultRetroBow } from '@shared/randomizer/world/retro/retro-from-snapshot';
import { DEFAULT_ACCESSIBILITY } from '@shared/randomizer/world/accessibility/accessibility-from-snapshot';
import { INCLUDE_NPC_CHECKS_KEY, INCLUDE_WORLD_ITEMS_KEY } from '@shared/randomizer/world/scope-option-keys';
import { DEFAULT_DUNGEON_ITEM_SETTING } from '@shared/randomizer/world/dungeon-items/dungeon-item-modes';
import { DEFAULT_STORY_GATES } from '@shared/randomizer/world/story-gates/story-gates.data';
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
