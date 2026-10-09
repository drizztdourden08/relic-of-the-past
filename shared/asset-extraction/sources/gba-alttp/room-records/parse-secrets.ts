/* @layer shared-asset-extraction @kind logic */
import { gbaAddressToOffset } from '../../../rom/gba-rom';
import type { GbaRomReader } from '../../../rom/gba-rom';
import type { DungeonSecretRecord } from '../../../dungeon/model';
import { MAX_ROOM_RECORDS, SECRET_GRID_COLS, SECRET_LIST_END, SECRET_RECORD_BYTES } from './room-records.constants';

const parseSecrets = (rom: GbaRomReader, address: number): DungeonSecretRecord[] => {
  let cursor = gbaAddressToOffset(address);
  const records: DungeonSecretRecord[] = [];
  while (rom.word(cursor) !== SECRET_LIST_END) {
    if (records.length >= MAX_ROOM_RECORDS) throw new Error(`Unterminated secret list at 0x${address.toString(16)}`);
    const position = rom.word(cursor);
    const cell = position >>> 1;
    records.push({
      x: cell % SECRET_GRID_COLS,
      y: Math.floor(cell / SECRET_GRID_COLS),
      type: rom.byte(cursor + 2),
      nativeBytes: rom.slice(cursor, SECRET_RECORD_BYTES),
    });
    cursor += SECRET_RECORD_BYTES;
  }
  return records;
};

export { parseSecrets };
