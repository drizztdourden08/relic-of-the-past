/* @layer shared-game @kind logic */
import { DARK_ROOM_LIGHT_FIELDS } from '../dark-room-lights.data';
import { darkRoomLightKeyOf, DARK_ROOM_REQUIRED_KEY } from '../dark-room-option-keys';
import type { OptionValue } from '../../options.type';
import type { DarkRoomSetting } from '../dark-room.type';

const darkRoomValuesOf = (setting: DarkRoomSetting): Record<string, OptionValue> => ({
  [DARK_ROOM_REQUIRED_KEY]: setting.requireLight,
  ...Object.fromEntries(DARK_ROOM_LIGHT_FIELDS.map((field) =>
    [darkRoomLightKeyOf(field), setting.lights[field]])),
});

export { darkRoomValuesOf };
