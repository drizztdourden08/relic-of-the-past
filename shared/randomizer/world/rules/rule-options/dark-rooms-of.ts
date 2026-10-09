/* @layer shared-game @kind logic */
import { REFERENCE_DARK_ROOM_SETTING } from '../../dark-rooms/dark-room-lights.data';
import type { DarkRoomSetting } from '../../dark-rooms/dark-room.type';
import type { World } from '../../world.type';

const darkRoomsOf = (world: World): DarkRoomSetting => world.options.darkRooms ?? REFERENCE_DARK_ROOM_SETTING;

export { darkRoomsOf };
