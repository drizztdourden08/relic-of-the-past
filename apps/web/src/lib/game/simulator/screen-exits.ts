/* @layer bridge-wasm @kind logic */
/**
 * Game-driven exit detection: flood a screen the way the game sees it and turn
 * everything the flood reached into traversal exits — border connections to
 * adjacent screens, doors/holes into rooms, exit doors back outside. This is
 * the ONLY source the simulator traverses on: no static connection data.
 * Overworld sub-screens of a big area are separate visits; indoor rooms are
 * handled by room-exits.ts.
 */
import type { GridPos } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import type { SimExit } from '@shared/game/simulation';
import type { ScreenDefinition } from '@shared/game/types';
import { SCREEN_BY_ID } from '@shared/game/data/screens';
import { computeBigScreenGroup } from '@domains/widgets/navigation/widget-helpers';
import { wasmGetEntranceRooms } from '../';
import { floodOneOverworld, summarizeRun, usableEntranceTransition } from './flood-screen';
import type { ScreenFlood, ScreenFloodRun } from './flood-screen';
import { owScreenId, interiorScreenId, spawnTile, screenAreaInfo } from './screen-resolve';
import { stepDistances, distanceAt, sortExitsByDistance, entryFromEdge, exitFromEdge, reachedGrid, AREA_EXIT_BIAS } from './exit-order';
import { detectRoom, dedupe } from './room-exits';

interface DetectedScreen {
  flood: ScreenFlood;
  exits: SimExit[];
  /** Flood-reached tiles — the engine's region memory for re-visits. */
  reached: boolean[][];
}

/** Entrance-transition exits of one flood run (doors + holes into rooms);
 *  item-gated entrances are excluded — Link can't take them yet. */
const entranceExits = (run: ScreenFloodRun, items: TileReq[], src?: ScreenDefinition): SimExit[] => {
  const rooms = wasmGetEntranceRooms();
  if (!rooms) return [];
  const exits: SimExit[] = [];
  for (const t of run.result.transitions) {
    if (t.edge !== 'entrance' || t.entranceIdx == null || t.entranceIdx >= 1000) continue;
    if (!usableEntranceTransition(run.result, t, items)) continue;
    const realId = t.entranceIdx >= 200 ? t.entranceIdx - 200 : t.entranceIdx;
    const destRoom = rooms[realId];
    if (destRoom == null) continue;
    exits.push({ to: interiorScreenId(destRoom, src), entryTile: spawnTile(realId, destRoom), fromTile: { row: t.row, col: t.col } });
  }
  return exits;
};

const OW_EDGE_ADJ = {
  north: (s: number) => (((s >> 3) & 7) > 0 ? s - 8 : null),
  south: (s: number) => (((s >> 3) & 7) < 7 ? s + 8 : null),
  west: (s: number) => ((s & 7) > 0 ? s - 1 : null),
  east: (s: number) => ((s & 7) < 7 ? s + 1 : null),
} as const;

/**
 * Flood ONE overworld sub-screen exactly like any other screen. Sub-screens of a
 * big area (castle-style groups) are separate visits: borders into sibling
 * sub-screens are ordinary exits, ordered before out-of-area ones so the whole
 * big screen gets explored before moving on.
 */
const detectOverworld = (screenIndex: number, items: TileReq[], entryTile?: GridPos, src?: ScreenDefinition): DetectedScreen | null => {
  const run = floodOneOverworld(screenIndex, items, entryTile);
  if (!run) return null;
  const group = new Set(computeBigScreenGroup(screenIndex));
  const inArea = group.size > 1;
  const dist = stepDistances(run.result.reachable, run.result.startPos);
  const exits: SimExit[] = [];
  const scores: number[] = [];
  const pushExit = (exit: SimExit, leavesArea: boolean): void => {
    exits.push(exit);
    const base = exit.fromTile ? distanceAt(dist, exit.fromTile) : 0xffff;
    scores.push(base + (inArea && leavesArea ? AREA_EXIT_BIAS : 0));
  };
  for (const conn of run.connections) {
    if (conn.freeTileCount === 0) continue;
    const to = owScreenId(conn.targetScreen);
    const mid = conn.positions[Math.floor(conn.positions.length / 2)] ?? 32;
    pushExit(
      { to, entryTile: entryFromEdge(conn.edge, mid), fromTile: exitFromEdge(conn.edge, mid), twoWay: true, area: screenAreaInfo(to) },
      !group.has(conn.targetScreen),
    );
  }
  for (const exit of entranceExits(run, items, src)) pushExit({ ...exit, area: screenAreaInfo(exit.to) }, true);

  return { flood: summarizeRun(run, items), exits: dedupe(sortExitsByDistance(exits, scores)), reached: reachedGrid(run.result.reachable) };
};

/** Detect a screen's flood numbers + game-driven exits. Null when unresolvable. */
const detectScreenExits = (screenId: string, opts?: { entryTile?: GridPos; items?: TileReq[] }): DetectedScreen | null => {
  const screen = SCREEN_BY_ID.get(screenId);
  if (!screen) return null;
  const items = opts?.items ?? ['lift.1'];
  const roomIndex = screen.roomIndex ?? 0;
  return screen.type === 'overworld'
    ? detectOverworld(roomIndex, items, opts?.entryTile, screen)
    : detectRoom(roomIndex, items, opts?.entryTile, screen);
};

export { detectScreenExits };
export type { DetectedScreen };
