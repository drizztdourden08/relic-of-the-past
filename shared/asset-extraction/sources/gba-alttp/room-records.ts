/* @layer shared-asset-extraction @kind logic */
/**
 * Per-room entity and secret lists, decoded the way the engine reads them.
 *
 * An entity record is three bytes (y, x, type) behind a sort-mode byte, terminated by 0xff; a
 * secret record is a two-byte tilemap position and an item byte, terminated by 0xffff. Both are
 * stored per room behind their own pointer tables.
 */
import { gbaAddressToOffset } from '../../rom/gba-rom';
import type { GbaRomReader } from '../../rom/gba-rom';
import type { DungeonEntityRecord, DungeonSecretRecord } from '../../dungeon/model';

const parseEntities = (rom: GbaRomReader, address: number): { sortMode: number; records: DungeonEntityRecord[] } => {
  let cursor = gbaAddressToOffset(address);
  const sortMode = rom.byte(cursor++);
  const records: DungeonEntityRecord[] = [];
  while (rom.byte(cursor) !== 0xff) {
    if (records.length >= 64) throw new Error(`Unterminated entity list at 0x${address.toString(16)}`);
    const y = rom.byte(cursor);
    const x = rom.byte(cursor + 1);
    const type = rom.byte(cursor + 2);
    const nativeBytes = rom.slice(cursor, 3);
    if (type === 0xe4 && (y === 0xfd || y === 0xfe)) {
      records.push({ kind: 'death-marker', x: 0, y: 0, floor: 0, subtype: 0, type, action: y === 0xfe ? 1 : 2, nativeBytes });
    } else {
      records.push({
        kind: x >= 0xe0 ? 'overlord' : 'entity',
        x: (x & 0x1f) << 4,
        y: (y & 0x1f) << 4,
        floor: y >>> 7,
        subtype: ((y & 0x60) >>> 2) | (x >>> 5),
        type,
        nativeBytes,
      });
    }
    cursor += 3;
  }
  return { sortMode, records };
};

const parseSecrets = (rom: GbaRomReader, address: number): DungeonSecretRecord[] => {
  let cursor = gbaAddressToOffset(address);
  const records: DungeonSecretRecord[] = [];
  while (rom.word(cursor) !== 0xffff) {
    if (records.length >= 64) throw new Error(`Unterminated secret list at 0x${address.toString(16)}`);
    const position = rom.word(cursor);
    const cell = position >>> 1;
    records.push({ x: cell % 64, y: Math.floor(cell / 64), type: rom.byte(cursor + 2), nativeBytes: rom.slice(cursor, 3) });
    cursor += 3;
  }
  return records;
};


export { parseEntities, parseSecrets };
