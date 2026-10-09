/* @layer shared-game @kind logic */
import { DARK_ROOM_LIGHT_FIELDS } from './dark-room-lights.constants';
import type { DarkRoomLightField, DarkRoomSetting } from '@rotp/game-core';

const acceptedLightsOf = (setting: DarkRoomSetting): readonly DarkRoomLightField[] =>
  DARK_ROOM_LIGHT_FIELDS.filter((field) => setting.lights[field]);

export { acceptedLightsOf };
