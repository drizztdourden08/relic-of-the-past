/* @layer shared-game @kind logic */
import { DARK_ROOM_LIGHT_FIELDS } from './dark-room-lights.data';
import type { DarkRoomLightField, DarkRoomSetting } from './dark-room.type';

const acceptedLightsOf = (setting: DarkRoomSetting): readonly DarkRoomLightField[] =>
  DARK_ROOM_LIGHT_FIELDS.filter((field) => setting.lights[field]);

export { acceptedLightsOf };
