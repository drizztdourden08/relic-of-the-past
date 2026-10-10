/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../checked-read';
import type { GbaRomReader } from '../rom/gba-rom';
import type { RomData } from '../rom/rom-types';
import { bankedRoomId } from './second-cartridge-bank';
import {
  BASE_TABLE_ADDRESS, BASE_TABLE_WORDS, ENTRY_TERMINATOR, MATCH_BYTES, MAX_APPENDED_WORDS,
} from './second-cartridge-torches.constants';

const baseTableBytes = (snes: RomData): Buffer => {
  const words = snes.getWords(BASE_TABLE_ADDRESS, BASE_TABLE_WORDS);
  const bytes = Buffer.alloc(words.length * 2);
  words.forEach((value: number, i: number) => bytes.writeUInt16LE(value, i * 2));
  return bytes;
};

const torchTableRecord = (gba: GbaRomReader, snes: RomData, roomIds: ReadonlySet<number>): Buffer => {
  const at = gba.bytes.indexOf(baseTableBytes(snes).subarray(0, MATCH_BYTES));
  if (at < 0) return Buffer.alloc(0);

  const tail = at + BASE_TABLE_WORDS * 2;
  const words: number[] = [];
  for (let i = 0; i < MAX_APPENDED_WORDS; i++) words.push(gba.word(tail + i * 2));

  const out: number[] = [];
  let read = 0;
  const wordAt = (index: number): number => itemAt(words, index, 'Torch table word');
  while (read < words.length && words[read] !== ENTRY_TERMINATOR) {
    const room = wordAt(read++);
    const positions: number[] = [];
    while (read < words.length && words[read] !== ENTRY_TERMINATOR) positions.push(wordAt(read++));
    read++;
    if (!roomIds.has(room) || positions.length === 0) continue;
    out.push(bankedRoomId(room), ...positions, ENTRY_TERMINATOR);
  }

  const record = Buffer.alloc(out.length * 2);
  out.forEach((word, i) => record.writeUInt16LE(word, i * 2));
  return record;
};

export { torchTableRecord };
