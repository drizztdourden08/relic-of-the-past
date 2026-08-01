/* @layer bridge-wasm @kind logic */
/**
 * Screen id → the numeric location the room-addressable reads need.
 *
 * A synthetic `room:N` / `ow:N` id still carries the number the GAME gave us — the
 * dataset simply has no definition for it. Returning null for those made the room a
 * hole in the graph: no grids, no interactables, no exits, zero tiles flooded. Once
 * doors became two-way such a node stopped being a harmless dead end and turned
 * into a connector, welding together every screen that ever pointed at it
 * (`room:277` joined lw-2e, lw-3a and lw-34 into one place). The number is all
 * traversal ever needed; the dataset only supplies the name.
 */
import type { SimLocation } from '@shared/game/simulation';
import { findOne } from '@shared/game/data';

const SYNTHETIC_ROOM = /^room:(\d+)(?:[@^].*)?$/;
const SYNTHETIC_OW = /^ow:(\d+)$/;

/**
 * The two kinds of screen keep their native index in DIFFERENT fields —
 * `overworldIndex` outdoors, `roomIndex` indoors — so one of them has to be
 * chosen by kind. Reading `roomIndex` for both resolved every overworld screen to
 * index 0: the caller then read, flooded and annotated the first screen of the
 * world instead of the one it asked for, while the reachability handed to it still
 * described the real screen. Nothing threw; the numbers were simply another
 * place's.
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
