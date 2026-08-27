/* @layer shared-asset-extraction @kind logic */
/**
 * The second cartridge's lightable torches.
 *
 * A torch is not part of a room's picture. The engine registers one from a table of
 * [room, position..., terminator] entries, and that same table doubles as the save data for
 * which torches are burning (the position word's high bit). The cartridge ships this table
 * as the base game's, word for word, with its own dungeon's entries appended past the point
 * the base game stops scanning at - so its torches come from data exactly like every other
 * torch in the game, and the only thing missing on our side was the appended tail.
 *
 * Found by matching the base game's own copy rather than by a stored offset: the two are
 * byte-identical up to the append point, which makes the base table its own address.
 */

import type { GbaRomReader } from '../rom/gba-rom';
import type { RomData } from '../rom/rom-types';
import { bankedRoomId } from './second-cartridge-bank';

const BASE_TABLE_ADDRESS = 0x84f36a;
const BASE_TABLE_WORDS = 144;
const ENTRY_TERMINATOR = 0xffff;
// Enough of the table to be unique in an 8MB cartridge, short enough to survive an edit to it.
const MATCH_BYTES = 64;
// A generous ceiling on the appended tail; the read stops at the table's own end long before.
const MAX_APPENDED_WORDS = 256;

const baseTableBytes = (snes: RomData): Buffer => {
  const words = snes.getWords(BASE_TABLE_ADDRESS, BASE_TABLE_WORDS);
  const bytes = Buffer.alloc(words.length * 2);
  words.forEach((value: number, i: number) => bytes.writeUInt16LE(value, i * 2));
  return bytes;
};

/**
 * The appended entries, rewritten into the engine's room numbering.
 *
 * Entries run until one names no room, which is how the cartridge closes the table. Rooms the
 * dungeon does not own are dropped: the tail is read positionally, so anything unexpected in
 * it stays out of the engine's table rather than being trusted.
 */
const torchTableRecord = (gba: GbaRomReader, snes: RomData, roomIds: ReadonlySet<number>): Buffer => {
  const at = gba.bytes.indexOf(baseTableBytes(snes).subarray(0, MATCH_BYTES));
  if (at < 0) return Buffer.alloc(0);

  const tail = at + BASE_TABLE_WORDS * 2;
  const words: number[] = [];
  for (let i = 0; i < MAX_APPENDED_WORDS; i++) words.push(gba.word(tail + i * 2));

  const out: number[] = [];
  let read = 0;
  while (read < words.length && words[read] !== ENTRY_TERMINATOR) {
    const room = words[read++];
    const positions: number[] = [];
    while (read < words.length && words[read] !== ENTRY_TERMINATOR) positions.push(words[read++]);
    read++;
    if (!roomIds.has(room) || positions.length === 0) continue;
    out.push(bankedRoomId(room), ...positions, ENTRY_TERMINATOR);
  }

  const record = Buffer.alloc(out.length * 2);
  out.forEach((word, i) => record.writeUInt16LE(word, i * 2));
  return record;
};

export { torchTableRecord };
