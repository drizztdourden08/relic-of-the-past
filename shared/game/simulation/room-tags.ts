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

const CLEAR_ROOM = 'clear enemies → doors open';

const ROOM_TAG_NAMES: Readonly<Record<number, string>> = {
  0x14: 'trigger → block door',
  0x15: 'prize → door',
  0x16: 'hold switch → door',
  0x17: 'switch → toggle door',
  0x18: 'water off',
  0x19: 'water on',
  0x1a: 'water gate',
  0x1c: 'moving wall (east)',
  0x1d: 'moving wall (west)',
  0x1e: 'moving wall — torches',
  0x1f: 'moving wall — torches',
  0x20: 'switch → exploding wall',
  0x21: 'holes',
  0x22: 'chest → holes',
  0x24: 'holes (second set)',
  0x25: 'heart for prize',
  0x26: 'kill room → block',
  0x27: 'trigger → chest',
  0x28: 'pull switch → exploding wall',
  0x33: 'torch puzzle → door',
  0x38: 'Agahnim',
  0x3c: 'push block → chest',
  0x3d: 'final boss door',
  0x3e: 'torch puzzle → chest',
  0x3f: 'rekillable boss',
};

/** Label for one tag byte; falls back to the hex value when unmapped. */
const roomTagName = (tag: number): string => {
  if (tag >= 0x01 && tag <= 0x13) return CLEAR_ROOM;
  return ROOM_TAG_NAMES[tag] ?? `tag 0x${tag.toString(16).padStart(2, '0')}`;
};

export { roomTagName, ROOM_TAG_NAMES };
