/* @layer bridge-wasm @kind logic */
/**
 * Two diagnostics for telling a room's real interior from the dead space around
 * it, for the `room=` probe.
 *
 * A dungeon supertile is always a full 64x64 grid and a room rarely fills it.
 * The remainder reads as attr `0x00`, the same value as plain floor, so a flood
 * seeded there spreads through space the player can never stand in. When a
 * crossing looks wrong these two answer the first question worth asking: is the
 * flood standing anywhere the game put something, and is the wall it left
 * through a wall at all?
 */
import type { RoomFloodRun } from './flood-room';
import { wasmGetRoomStairInfoFor } from '../';
import { getScreenGrids } from '../flood';
import { getRoomChests, getRoomSprites, getRoomDoors } from './interactables';

type Edge = 'north' | 'south' | 'east' | 'west';

/** Anchors sit on walls and in doorways, so a record can be a tile or two off
 *  the floor the player actually stands on. */
const ANCHOR_SLACK = 2;

const passable = (a: number): boolean => a === 0x00 || (a >= 0x80 && a <= 0x8d) || (a >= 0x90 && a <= 0xaf);

/**
 * How much of one outer wall is open, counted on the outermost tile ring.
 *
 * Read this as padding, not as wall: nearly every room answers 64 on every edge
 * because the supertile's outer ring is open all the way round. That ring is
 * exactly what lets a stray flood run a room's whole perimeter, so a low number
 * here is the interesting case, not a high one.
 */
const edgeOpenCount = (roomId: number, edge: Edge): number => {
  const bundle = getScreenGrids({ isIndoors: true, roomId, owScreenIndex: 0 });
  const grids = [bundle.rawAttrGrid, ...(bundle.dualLayerGrids ? [bundle.dualLayerGrids.layer0, bundle.dualLayerGrids.layer1] : [])];
  let open = 0;
  for (let p = 0; p < 64; p++) {
    const r = edge === 'north' ? 0 : edge === 'south' ? 63 : p;
    const c = edge === 'west' ? 0 : edge === 'east' ? 63 : p;
    if (grids.some((g) => passable(g[r]?.[c] ?? 1))) open += 1;
  }
  return open;
};

/** Which of the room's own doors, stairs, chests, sprites and entrance seeds
 *  this flood actually reached. A flood that hits none of them is standing in
 *  dead space, whatever its tile count says. */
const floodAnchorReport = (roomId: number, run: RoomFloodRun): { total: number; hits: string[]; missed: string[] } => {
  const named = [
    ...getRoomDoors(roomId).flatMap((d) => d.tiles.map((t) => ({ tag: `door:${d.direction}`, ...t }))),
    ...wasmGetRoomStairInfoFor(roomId).map((s) => ({ tag: 'stair', row: s.row, col: s.col })),
    ...getRoomChests(roomId).map((c) => ({ tag: 'chest', ...c.tile })),
    ...getRoomSprites(roomId).map((s) => ({ tag: `sprite:${s.spriteType}`, ...s.tile })),
    ...run.entrances.map((e) => ({ tag: `ent:${e.id}`, row: e.gridRow, col: e.gridCol })),
  ];
  const hit = (row: number, col: number): boolean => {
    for (let dr = -ANCHOR_SLACK; dr <= ANCHOR_SLACK; dr++) {
      for (let dc = -ANCHOR_SLACK; dc <= ANCHOR_SLACK; dc++) {
        if ((run.result.reachable[row + dr]?.[col + dc] ?? 0) > 0) return true;
      }
    }
    return false;
  };
  const hits: string[] = [];
  const missed: string[] = [];
  for (const a of named) (hit(a.row, a.col) ? hits : missed).push(`${a.tag}@${a.row},${a.col}`);
  return { total: named.length, hits, missed };
};

export { floodAnchorReport, edgeOpenCount };
export type { Edge };
