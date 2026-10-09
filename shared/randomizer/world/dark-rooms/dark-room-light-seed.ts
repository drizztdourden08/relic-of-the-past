/* @layer shared-game @kind logic */
import { itemKeyName } from '../display-names/item-key-name';
import { DARK_ROOM_LIGHT_ITEMS, DEFAULT_DARK_ROOM_SETTING } from './dark-room-lights.data';
import { darkRoomLightKeyOf } from './dark-room-option-keys';
import { DARK_ROOM_TOGGLE } from './dark-room-toggle.constants';
import type { OptionSeed } from '../options.type';
import type { DarkRoomLightField } from '@rotp/game-core';

const darkRoomLightSeed = (field: DarkRoomLightField): OptionSeed => ({
  ...DARK_ROOM_TOGGLE,
  key: darkRoomLightKeyOf(field),
  displayName: `${itemKeyName(DARK_ROOM_LIGHT_ITEMS[field])} lights a dark room`,
  sourceDefault: DEFAULT_DARK_ROOM_SETTING.lights[field],
  baseline: DEFAULT_DARK_ROOM_SETTING.lights[field],
});

export { darkRoomLightSeed };
