/* @layer shared-asset-extraction @kind logic */
import { gbaAddressToOffset } from '../../../rom/gba-rom';
import type { GbaRomReader } from '../../../rom/gba-rom';
import type { DungeonEntityRecord } from '../../../dungeon/model';
import type { ParsedEntityList } from './room-records.type';
import {
  DEATH_MARKER_TYPE, ENTITY_LIST_END, ENTITY_RECORD_BYTES, MAX_ROOM_RECORDS, OVERLORD_MIN_X_BYTE,
} from './room-records.constants';

const parseEntities = (rom: GbaRomReader, address: number): ParsedEntityList => {
  let cursor = gbaAddressToOffset(address);
  const sortMode = rom.byte(cursor++);
  const records: DungeonEntityRecord[] = [];
  while (rom.byte(cursor) !== ENTITY_LIST_END) {
    if (records.length >= MAX_ROOM_RECORDS) throw new Error(`Unterminated entity list at 0x${address.toString(16)}`);
    const y = rom.byte(cursor);
    const x = rom.byte(cursor + 1);
    const type = rom.byte(cursor + 2);
    const nativeBytes = rom.slice(cursor, ENTITY_RECORD_BYTES);
    if (type === DEATH_MARKER_TYPE && (y === 0xfd || y === 0xfe)) {
      records.push({ kind: 'death-marker', x: 0, y: 0, floor: 0, subtype: 0, type, action: y === 0xfe ? 1 : 2, nativeBytes });
    } else {
      records.push({
        kind: x >= OVERLORD_MIN_X_BYTE ? 'overlord' : 'entity',
        x: (x & 0x1f) << 4,
        y: (y & 0x1f) << 4,
        floor: y >>> 7,
        subtype: ((y & 0x60) >>> 2) | (x >>> 5),
        type,
        nativeBytes,
      });
    }
    cursor += ENTITY_RECORD_BYTES;
  }
  return { sortMode, records };
};

export { parseEntities };
