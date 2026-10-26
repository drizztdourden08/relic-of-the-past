/* @layer renderer-lib @kind constants */
import { ACCESSIBILITY_KEY, DEATH_LINK_KEY, darkRoomLightKeyOf, DARK_ROOM_REQUIRED_KEY, DUNGEON_ITEM_OPTION_KEYS, INCLUDE_NPC_CHECKS_KEY, INCLUDE_WORLD_ITEMS_KEY } from '@rotp/randomizer';
import type { ChoiceField } from './randomizer-choices.type';

const PLAIN_FIELD_BY_KEY: Readonly<Record<string, ChoiceField>> = {
  key_drop_shuffle: 'keyDropShuffle',
  [DEATH_LINK_KEY]: 'deathLink',
  [INCLUDE_NPC_CHECKS_KEY]: 'includeNpcChecks',
  [INCLUDE_WORLD_ITEMS_KEY]: 'includeWorldItems',
  dungeon_prize_shuffle: 'shufflePrizes',
  [DUNGEON_ITEM_OPTION_KEYS.bigKey]: 'bigKeyShuffle',
  [DUNGEON_ITEM_OPTION_KEYS.smallKey]: 'smallKeyShuffle',
  [DUNGEON_ITEM_OPTION_KEYS.compass]: 'compassShuffle',
  [DUNGEON_ITEM_OPTION_KEYS.map]: 'mapShuffle',
  [ACCESSIBILITY_KEY]: 'accessibility',
  [DARK_ROOM_REQUIRED_KEY]: 'darkRoomLightRequired',
  [darkRoomLightKeyOf('lamp')]: 'darkRoomLightLamp',
  [darkRoomLightKeyOf('fireRod')]: 'darkRoomLightFireRod',
  [darkRoomLightKeyOf('bombos')]: 'darkRoomLightBombos',
  [darkRoomLightKeyOf('redCane')]: 'darkRoomLightRedCane',
};

const NUMERIC_FIELDS: ReadonlySet<ChoiceField> = new Set([]);

const CHOICE_FIELDS: ReadonlySet<ChoiceField> = new Set<ChoiceField>([
  'accessibility', 'bigKeyShuffle', 'smallKeyShuffle', 'compassShuffle', 'mapShuffle',
]);

export { CHOICE_FIELDS, NUMERIC_FIELDS, PLAIN_FIELD_BY_KEY };
