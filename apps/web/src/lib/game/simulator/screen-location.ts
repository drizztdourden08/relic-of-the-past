/* @layer bridge-wasm @kind logic */
/**
 * Screen id -> the numeric location the room-addressable reads need. A synthetic `room:N` /
 * `ow:N` id still carries the GAME's number; returning null for those made the room a hole in
 * the graph, and with two-way doors a hole welds together every screen pointing at it
 * (`room:277` joined lw-2e, lw-3a and lw-34). The dataset only supplies the name.
 */
import type { SimLocation } from '@shared/game/simulation';
import { findOne } from '@shared/game/data';

const SYNTHETIC_ROOM = /^room:(\d+)(?:[@^].*)?$/;
const SYNTHETIC_OW = /^ow:(\d+)$/;

/**
 * The native index lives in DIFFERENT fields by kind: `overworldIndex` outdoors, `roomIndex`
 * indoors. Reading `roomIndex` for both silently resolved every overworld screen to index 0.
 */
const locationForScreen = (screenId: string): SimLocation | null => {
  const screen = findOne('screen', (s) => s.id === screenId);
  if (!screen) {
    const room = SYNTHETIC_ROOM.exec(screenId);
    if (room) return { isIndoors: true, roomId: Number(room[1]), owScreenIndex: 0 };
    const ow = SYNTHETIC_OW.exec(screenId);
    if (ow) return { isIndoors: false, roomId: 0, owScreenIndex: Number(ow[1]) };
    return null;
  }
  const isIndoors = screen.kind !== 'overworld';
  const index = (isIndoors ? screen.gameId.roomIndex : screen.gameId.overworldIndex) ?? 0;
  return { isIndoors, roomId: isIndoors ? index : 0, owScreenIndex: isIndoors ? 0 : index };
};

export { locationForScreen };
