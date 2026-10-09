/* @layer renderer-lib @kind constants */
import { ACCESSIBILITY_KEY } from '@shared/randomizer/world/accessibility/accessibility-from-snapshot';
import { darkRoomLightKeyOf, DARK_ROOM_REQUIRED_KEY } from '@shared/randomizer/world/dark-rooms/dark-room-option-keys';
import { DUNGEON_ITEM_OPTION_KEYS } from '@shared/randomizer/world/dungeon-items/dungeon-item-modes';
import { INCLUDE_NPC_CHECKS_KEY, INCLUDE_WORLD_ITEMS_KEY } from '@shared/randomizer/world/scope-option-keys';
import type { ChoiceField } from './randomizer-choices.type';

const PLAIN_FIELD_BY_KEY: Readonly<Record<string, ChoiceField>> = {
  key_drop_shuffle: 'keyDropShuffle',
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
