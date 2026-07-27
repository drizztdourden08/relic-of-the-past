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
import { SCREEN_BY_ID } from '@shared/game/data/screens';

const SYNTHETIC_ROOM = /^room:(\d+)(?:[@^].*)?$/;
const SYNTHETIC_OW = /^ow:(\d+)$/;

const locationForScreen = (screenId: string): SimLocation | null => {
  const screen = SCREEN_BY_ID.get(screenId);
  if (!screen) {
    const room = SYNTHETIC_ROOM.exec(screenId);
    if (room) return { isIndoors: true, roomId: Number(room[1]), owScreenIndex: 0 };
    const ow = SYNTHETIC_OW.exec(screenId);
    if (ow) return { isIndoors: false, roomId: 0, owScreenIndex: Number(ow[1]) };
    return null;
  }
  const isIndoors = screen.type !== 'overworld';
  const roomIndex = screen.roomIndex ?? 0;
  return { isIndoors, roomId: isIndoors ? roomIndex : 0, owScreenIndex: isIndoors ? 0 : roomIndex };
};

/**
 * A human label for a traversal key. NAMES ONLY — nothing here may influence a
 * traversal decision. When several interiors share a room index the first is
 * taken; a wrong label is cosmetic now that identity is the number.
 */
const displayNameFor = (screenId: string): string => {
  const known = SCREEN_BY_ID.get(screenId);
  if (known) return known.name;
  const loc = locationForScreen(screenId);
  if (!loc) return screenId;
  const wantOverworld = !loc.isIndoors;
  const index = wantOverworld ? loc.owScreenIndex : loc.roomId;
  for (const s of SCREEN_BY_ID.values()) {
    if ((s.type === 'overworld') !== wantOverworld) continue;
    if ((s.roomIndex ?? -1) === index) return s.name;
  }
  return screenId;
};

export { locationForScreen, displayNameFor };
