/* @layer shared-game @kind logic */
import { REFERENCE_DARK_ROOM_SETTING } from './dark-room-lights.data';
import type { DarkRoomSetting } from '@rotp/game-core';
import type { World } from '../world.type';

const darkRoomSettingOf = (world: World): DarkRoomSetting =>
  world.options.darkRooms ?? REFERENCE_DARK_ROOM_SETTING;

export { darkRoomSettingOf };
