/* @layer shared-game @kind logic */
import { CLEAR_ROOM_TAG_FIRST, CLEAR_ROOM_TAG_LAST } from './room-tags.constants';

const isClearRoomTag = (tag: number): boolean => tag >= CLEAR_ROOM_TAG_FIRST && tag <= CLEAR_ROOM_TAG_LAST;

export { isClearRoomTag };
