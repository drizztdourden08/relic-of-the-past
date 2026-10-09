/* @layer shared-game @kind logic */
import { REFERENCE_DARK_ROOM_SETTING } from '../../dark-rooms/dark-room-lights.constants';
import type { DarkRoomSetting } from '@rotp/game-core';
import type { World } from '../../world.type';

const darkRoomsOf = (world: World): DarkRoomSetting => world.options.darkRooms ?? REFERENCE_DARK_ROOM_SETTING;

export { darkRoomsOf };
