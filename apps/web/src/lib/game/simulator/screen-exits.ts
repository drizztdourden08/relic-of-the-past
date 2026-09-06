/* @layer bridge-wasm @kind logic */
// Game-driven exit detection: flood a screen and turn everything reached into traversal exits.
// This is the ONLY source the simulator traverses on; no static connection data. Sub-screens of
// a big area are separate visits; indoor rooms are room-exits.ts.
import type { GridPos } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import type { SimExit } from '@shared/game/simulation';
import type { ScreenRecord } from '@shared/game/data';
import { findOne } from '@shared/game/data';
import { computeBigScreenGroup } from '@domains/widgets/navigation/widget-helpers';
import { wasmGetEntranceRooms } from '../';
import { floodOneOverworld, summarizeRun, usableEntranceTransition } from './flood-screen';
import type { ScreenFlood, ScreenFloodRun } from './flood-screen';
import { owScreenId, interiorScreenId, spawnTile, screenAreaInfo } from './screen-resolve';
import { stepDistances, distanceAt, sortExitsByDistance, entryFromEdge, exitFromEdge, reachedGrid, AREA_EXIT_BIAS } from './exit-order';
import { detectRoom, dedupe } from './room-exits';
import { locationForScreen } from './screen-location';

interface DetectedScreen {
  flood: ScreenFlood;
  exits: SimExit[];
  /** Flood-reached tiles: the engine's region memory for re-visits. */
  reached: boolean[][];
}

/** Entrance ids at or above this offset are fall holes, not doors: one-way edges.
 *  Below it is an ordinary doorway the player can walk back through
 *  (`enrichEntrances` merges holes in at `200 + id`). */
const FALL_HOLE_ID_BASE = 200;

/** Entrance-transition exits of one flood run (doors + holes into rooms);
 *  item-gated entrances are excluded because the player can't take them yet. */
const entranceExits = (run: ScreenFloodRun, items: TileReq[], fromKey: string, src?: ScreenRecord): SimExit[] => {
  const rooms = wasmGetEntranceRooms();
  if (!rooms) return [];
  const exits: SimExit[] = [];
  for (const t of run.result.transitions) {
    if (t.edge !== 'entrance' || t.entranceIdx == null || t.entranceIdx >= 1000) continue;
    if (!usableEntranceTransition(run.result, t, items)) continue;
    const isFallHole = t.entranceIdx >= FALL_HOLE_ID_BASE;
    const realId = isFallHole ? t.entranceIdx - FALL_HOLE_ID_BASE : t.entranceIdx;
    const destRoom = rooms[realId];
    if (destRoom == null) continue;
    const landing = spawnTile(realId, destRoom);
    exits.push({
      to: interiorScreenId(destRoom, landing, fromKey),
      entryTile: landing,
      fromTile: { row: t.row, col: t.col },
      twoWay: !isFallHole,
      origin: 'ow-entrance',
      edgeSig: `e${realId}`,
    });
  }
  return exits;
};

/** A crossing's tile span is its identity on the wall. Two crossings on the same
 *  side of a screen have disjoint spans, which is what tells them apart. */
const spanOf = (positions: readonly number[]): string =>
  positions.length === 0 ? '?' : `${Math.min(...positions)}-${Math.max(...positions)}`;

const OW_EDGE_ADJ = {
  north: (s: number) => (((s >> 3) & 7) > 0 ? s - 8 : null),
  south: (s: number) => (((s >> 3) & 7) < 7 ? s + 8 : null),
  west: (s: number) => ((s & 7) > 0 ? s - 1 : null),
  east: (s: number) => ((s & 7) < 7 ? s + 1 : null),
} as const;

/**
 * Flood ONE overworld sub-screen like any other screen. Borders into sibling sub-screens are
 * ordinary exits, ordered before out-of-area ones so the whole big screen is explored first.
 */
const detectOverworld = (screenIndex: number, items: TileReq[], entryTile?: GridPos, src?: ScreenRecord, fromKey = `ow:${screenIndex}`): DetectedScreen | null => {
  const run = floodOneOverworld(screenIndex, items, entryTile);
  if (!run) return null;
  const group = new Set(computeBigScreenGroup(screenIndex));
  const inArea = group.size > 1;
  const dist = stepDistances(run.result.reachable, run.result.startPos, run.result.ledges);
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
    const span = spanOf(conn.positions);
    pushExit(
      { to, entryTile: entryFromEdge(conn.edge, mid), fromTile: exitFromEdge(conn.edge, mid), twoWay: true, origin: 'ow-border', edgeSig: `${conn.edge}:${span}`, area: screenAreaInfo(to) },
      !group.has(conn.targetScreen),
    );
  }
  for (const exit of entranceExits(run, items, fromKey, src)) pushExit({ ...exit, area: screenAreaInfo(exit.to) }, true);

  return { flood: summarizeRun(run, items), exits: dedupe(sortExitsByDistance(exits, scores)), reached: reachedGrid(run.result.reachable) };
};

/**
 * Detect a screen's flood numbers + game-driven exits. A synthetic id the dataset does not
 * define still names a real room, so it is detected from its number with no `src`.
 */
const detectScreenExits = (screenId: string, opts?: { entryTile?: GridPos; items?: TileReq[] }): DetectedScreen | null => {
  const items = opts?.items ?? ['lift.1'];
  // ONE resolution for both vocabularies. A second copy read the overworld index out of
  // `roomIndex`, which overworld records lack, so every dataset-id detection ran on screen 0.
  const loc = locationForScreen(screenId);
  if (!loc) return null;
  // The resolved screen record plays no part on the indoor path, so it is not passed through.
  return loc.isIndoors
    ? detectRoom(loc.roomId, items, opts?.entryTile, undefined, screenId)
    : detectOverworld(loc.owScreenIndex, items, opts?.entryTile, findOne('screen', (s) => s.id === screenId), screenId);
};

export { detectScreenExits };
export type { DetectedScreen };
