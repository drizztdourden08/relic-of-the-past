/* @layer shared-game @kind logic */
import { ROOM_TAG_NAMES } from '../data/native-tables';
import { CLEAR_ROOM_TAG_NAME } from './room-tags.constants';
import { isClearRoomTag } from './is-clear-room-tag';

const roomTagName = (tag: number): string => {
  if (isClearRoomTag(tag)) return CLEAR_ROOM_TAG_NAME;
  return ROOM_TAG_NAMES[tag] ?? `tag 0x${tag.toString(16).padStart(2, '0')}`;
};

export { roomTagName };
