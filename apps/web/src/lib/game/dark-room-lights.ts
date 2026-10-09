/* @layer bridge-wasm @kind logic */
import type { DarkRoomSetting } from '@shared/randomizer/world/dark-rooms/dark-room.type';
import { DARK_ROOM_LIGHT_BIT, LAMP_ONLY_WORD } from './dark-room-lights.constants';

const darkRoomLightWordOf = (setting: DarkRoomSetting): number => {
  let word = LAMP_ONLY_WORD;
  if (setting.lights.fireRod) word |= DARK_ROOM_LIGHT_BIT.rod;
  if (setting.lights.bombos) word |= DARK_ROOM_LIGHT_BIT.medallion;
  if (setting.lights.redCane) word |= DARK_ROOM_LIGHT_BIT.redCane;
  return word;
};

export { darkRoomLightWordOf };
