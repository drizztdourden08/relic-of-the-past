/* @layer shared-game @kind logic */
import { DARK_ROOM_LIGHT_SNAKE_NAMES } from './dark-room-option-keys.constants';
import type { DarkRoomLightField } from '@rotp/game-core';

const darkRoomLightKeyOf = (field: DarkRoomLightField): string =>
  `dark_room_light_${DARK_ROOM_LIGHT_SNAKE_NAMES[field]}`;

export { darkRoomLightKeyOf };
