/* @layer shared-game @kind logic */
import { DARK_ROOM_KEY_SET } from './dark-room-key-lists.constants';

const isDarkRoomOptionKey = (key: string): boolean => DARK_ROOM_KEY_SET.has(key);

export { isDarkRoomOptionKey };
