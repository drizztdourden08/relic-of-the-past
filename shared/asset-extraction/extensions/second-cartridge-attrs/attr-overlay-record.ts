/* @layer shared-asset-extraction @kind logic */
import type { DungeonRoomRecord } from '../../dungeon/model';
import type { AttrOverlayCell } from './second-cartridge-attrs.type';
import { ENTRANCE_CHAMBER_ROOM, HUB_ROOM, OVERLAY_RECORD_BYTES } from './second-cartridge-attrs.constants';
import { entranceChamberOverlay } from './entrance-chamber-overlay';
import { hubOverlay } from './hub-overlay';
import { ledgeOverlay } from './ledge-overlay';
import { waterOverlay } from './water-overlay';

const roomOverlays: Readonly<Record<number, () => AttrOverlayCell[]>> = {
  [HUB_ROOM]: hubOverlay,
  [ENTRANCE_CHAMBER_ROOM]: entranceChamberOverlay,
};

const attrOverlayRecord = (room: DungeonRoomRecord): Buffer => {
  const build = roomOverlays[room.id];
  const cells = [...(build ? build() : []), ...waterOverlay(room), ...ledgeOverlay(room)];
  if (cells.length === 0) return Buffer.alloc(0);
  const record = Buffer.alloc(cells.length * OVERLAY_RECORD_BYTES);
  cells.forEach(({ layer, cell, attr }, i) => {
    record[i * OVERLAY_RECORD_BYTES] = layer;
    record.writeUInt16LE(cell, i * OVERLAY_RECORD_BYTES + 1);
    record[i * OVERLAY_RECORD_BYTES + 3] = attr;
  });
  return record;
};

export { attrOverlayRecord };
