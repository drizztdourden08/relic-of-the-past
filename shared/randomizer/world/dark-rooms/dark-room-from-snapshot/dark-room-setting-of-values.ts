/* @layer shared-game @kind logic */
import { optionFlagOf } from '../../option-flag-of';
import { includeWorldItemsOf } from '../../scope-option-keys';
import { DARK_ROOM_LIGHT_FIELDS, DEFAULT_DARK_ROOM_SETTING } from '../dark-room-lights.data';
import { maskDarkRoomLights } from '../mask-dark-room-lights';
import { darkRoomLightKeyOf, DARK_ROOM_REQUIRED_KEY } from '../dark-room-option-keys';
import type { OptionValues } from '../../options.type';
import type { DarkRoomLights, DarkRoomSetting } from '../dark-room.type';

const darkRoomSettingOfValues = (values: OptionValues): DarkRoomSetting => {
  const stored = Object.fromEntries(DARK_ROOM_LIGHT_FIELDS.map((field) =>
    [field, optionFlagOf(values, darkRoomLightKeyOf(field), DEFAULT_DARK_ROOM_SETTING.lights[field])],
  )) as unknown as DarkRoomLights;
  return {
    requireLight: optionFlagOf(values, DARK_ROOM_REQUIRED_KEY, DEFAULT_DARK_ROOM_SETTING.requireLight),
    lights: maskDarkRoomLights(stored, includeWorldItemsOf(values)),
  };
};

export { darkRoomSettingOfValues };
