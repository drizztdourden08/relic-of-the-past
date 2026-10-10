/* @layer shared-game @kind logic */
import { recordBy } from '../../../keyed-record';
import { optionFlagOf } from '../../option-flag-of';
import { includeWorldItemsOf } from '../../scope-option-keys';
import { DARK_ROOM_LIGHT_FIELDS, DEFAULT_DARK_ROOM_SETTING } from '../dark-room-lights.constants';
import { maskDarkRoomLights } from '../mask-dark-room-lights';
import { darkRoomLightKeyOf, DARK_ROOM_REQUIRED_KEY } from '../dark-room-option-keys';
import type { OptionValues } from '../../options.type';
import type { DarkRoomSetting } from '@rotp/game-core';

const darkRoomSettingOfValues = (values: OptionValues): DarkRoomSetting => {
  const stored = recordBy(DARK_ROOM_LIGHT_FIELDS, (field) => field, (field) =>
    optionFlagOf(values, darkRoomLightKeyOf(field), DEFAULT_DARK_ROOM_SETTING.lights[field]));
  return {
    requireLight: optionFlagOf(values, DARK_ROOM_REQUIRED_KEY, DEFAULT_DARK_ROOM_SETTING.requireLight),
    lights: maskDarkRoomLights(stored, includeWorldItemsOf(values)),
  };
};

export { darkRoomSettingOfValues };
