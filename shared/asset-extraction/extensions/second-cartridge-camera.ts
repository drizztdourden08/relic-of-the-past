/* @layer shared-asset-extraction @kind logic */
/**
 * Camera bounds for rooms whose baked maps are wider than their real content.
 *
 * The port padded some rooms' unused side columns with byte-exact copies of the opposite
 * side — on original hardware the camera never travels there, so the padding is never seen.
 * A wide view exposes it. This detects that padding (outer 16-column blocks identical on
 * both layers) and emits the camera range that keeps the view on the real content, in the
 * same world coordinates the engine's own room-bounds registers hold. Rooms without padding
 * emit an empty record and keep fully vanilla camera behaviour.
 */
import type { DungeonRoomRecord } from '../dungeon/model';

/** Padding is mirrored in whole 16-column blocks (128px). */
const PAD_COLS = 16;
const MAP_COLS = 64;
const MAP_ROWS = 64;
const ROOM_SPAN = 0x200;
const VIEW_WIDTH = 256;
const PIN_X_FLAG = 1;

const outerColumnsAreCopies = (words: Uint16Array | readonly number[]): boolean => {
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < PAD_COLS; col++) {
      if (words[row * MAP_COLS + col] !== words[row * MAP_COLS + (MAP_COLS - PAD_COLS) + col]) {
        return false;
      }
    }
  }
  return true;
};

/**
 * The room's camera-bounds record: 3 words — flags, camera minimum X, camera maximum X.
 * Empty when the room needs nothing beyond vanilla behaviour.
 */
const cameraBoundsRecord = (room: DungeonRoomRecord): Buffer => {
  if (!outerColumnsAreCopies(room.layers[0].snesWords) ||
      !outerColumnsAreCopies(room.layers[1].snesWords)) {
    return Buffer.alloc(0);
  }
  const originX = (room.id % 16) * ROOM_SPAN;
  const contentLeft = originX + PAD_COLS * 8;
  const contentRight = originX + (MAP_COLS - PAD_COLS) * 8;
  const camMin = contentLeft;
  const camMax = Math.max(camMin, contentRight - VIEW_WIDTH);
  const record = Buffer.alloc(6);
  record.writeUInt16LE(PIN_X_FLAG, 0);
  record.writeUInt16LE(camMin, 2);
  record.writeUInt16LE(camMax, 4);
  return record;
};

export { cameraBoundsRecord };
