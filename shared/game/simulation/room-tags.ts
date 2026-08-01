/* @layer shared-game @kind constants */
/**
 * Human names for the room-header TAG bytes, indexed exactly like the game's own
 * tag-routine dispatch table (`kDungTagroutines`, 0x00-0x3F).
 *
 * A raw `tag 0x26` in the widget says nothing; "kill room → block" says why a
 * door is shut. Entries the dispatch table sends to an unnamed stub are left out
 * and fall back to the hex value, so this table never claims to know more than it
 * does. Tags 0x01-0x13 are the clear-the-room family the simulator gates on.
 */
import { ROOM_TAG_NAMES } from '../data/native-tables';

const CLEAR_ROOM = 'clear enemies → doors open';

/** Label for one tag byte; falls back to the hex value when unmapped. */
const roomTagName = (tag: number): string => {
  if (tag >= 0x01 && tag <= 0x13) return CLEAR_ROOM;
  return ROOM_TAG_NAMES[tag] ?? `tag 0x${tag.toString(16).padStart(2, '0')}`;
};

export { roomTagName, ROOM_TAG_NAMES };
