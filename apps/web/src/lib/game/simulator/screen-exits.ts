/* @layer bridge-wasm @kind logic */
import type { ConnectionInfo, GridPos, ScreenCrossing } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import type { SimExit } from '@shared/game/simulation';
import { computeBigScreenGroup } from '@domains/widgets/navigation/widget-helpers';
import { collectCrossings } from '../crossings';
import { connectionCrossingId, midOf, takeableCrossing, usableCrossings } from '../usable-crossings';
import { floodOneOverworld, summarizeRun } from './flood-screen';
import type { ScreenFlood } from './flood-screen';
import { owScreenId, interiorScreenId, spawnTile, screenAreaInfo } from './screen-resolve';
import { stepDistances, distanceAt, sortExitsByDistance, entryFromEdge, reachedGrid, AREA_EXIT_BIAS } from './exit-order';
import { detectRoom, dedupe } from './room-exits';
import { locationForScreen } from './screen-location';

interface DetectedScreen {
  flood: ScreenFlood;
  exits: SimExit[];
  /** Flood-reached tiles — the engine's region memory for re-visits. */
  reached: boolean[][];
}

/** Ordering score for an exit whose tile the walk never reached. */
const UNREACHED = 0xffff;

interface OverworldExitPass {
  fromKey: string;
  bundles: Map<string, ConnectionInfo>;
  /** Sub-screens of the big area being visited; a group of one is a plain screen. */
  group: Set<number>;
}

/** An exit plus whether taking it leaves the big area currently being explored. */
interface OrderedExit {
  exit: SimExit;
  leavesArea: boolean;
}

const tailNumber = (id: string): number => Number(id.slice(id.indexOf(':') + 1));

const roomOf = (crossing: ScreenCrossing): number | null =>
  crossing.target.native?.kind === 'room' ? crossing.target.native.room : null;

const screenOf = (crossing: ScreenCrossing): number | null =>
  crossing.target.native?.kind === 'overworld' ? crossing.target.native.screen : null;

const borderExit = (crossing: ScreenCrossing, pass: OverworldExitPass): OrderedExit | null => {
  const target = screenOf(crossing);
  const connection = pass.bundles.get(crossing.id);
  if (target === null || !connection) return null;
  const to = owScreenId(target);
  return {
    exit: {
      to,
      entryTile: entryFromEdge(connection.edge, midOf(connection.positions)),
      fromTile: crossing.tile,
      twoWay: true,
      origin: 'ow-border',
      edgeSig: crossing.id.slice('edge:'.length),
      ...(screenAreaInfo(to) ? { area: screenAreaInfo(to) } : {}),
    },
    leavesArea: !pass.group.has(target),
  };
};

/**
 * A door or a pit into a room. A pit is genuinely one-way — the player drops in
 * and must find another way out — while a doorway can always be walked back
 * through, which is what `twoWay` tells the graph.
 */
const entranceExit = (crossing: ScreenCrossing, pass: OverworldExitPass): OrderedExit | null => {
  const destRoom = roomOf(crossing);
  if (destRoom === null) return null;
  const entranceId = tailNumber(crossing.id);
  const landing = spawnTile(entranceId, destRoom);
  const to = interiorScreenId(destRoom, landing, pass.fromKey);
  return {
    exit: {
      to,
      ...(landing ? { entryTile: landing } : {}),
      fromTile: crossing.tile,
      twoWay: crossing.origin !== 'fall-hole',
      origin: 'ow-entrance',
      edgeSig: `e${entranceId}`,
      ...(screenAreaInfo(to) ? { area: screenAreaInfo(to) } : {}),
    },
    leavesArea: true,
  };
};

const overworldExitFor = (crossing: ScreenCrossing, pass: OverworldExitPass): OrderedExit | null => {
  if (crossing.class === 'edge') return borderExit(crossing, pass);
  if (crossing.origin === 'ow-entrance' || crossing.origin === 'fall-hole') return entranceExit(crossing, pass);
  return null;
};

/**
 * Flood ONE overworld sub-screen exactly like any other screen. Sub-screens of a
 * big area (castle-style groups) are separate visits: borders into sibling
 * sub-screens are ordinary exits, ordered before out-of-area ones so the whole
 * big screen gets explored before moving on.
 */
const detectOverworld = (screenIndex: number, items: TileReq[], entryTile?: GridPos, fromKey = `ow:${screenIndex}`): DetectedScreen | null => {
  const run = floodOneOverworld(screenIndex, items, entryTile);
  if (!run) return null;
  const scope = {
    isIndoors: false, roomIndex: 0, owScreenIndex: screenIndex,
    flood: run.result, connections: run.connections, items,
  };
  const crossings = usableCrossings(collectCrossings(scope), scope);
  const bundles = new Map<string, ConnectionInfo>();
  for (const connection of run.connections) bundles.set(connectionCrossingId(connection), connection);
  const group = new Set(computeBigScreenGroup(screenIndex));
  const pass: OverworldExitPass = { fromKey, bundles, group };
  const dist = stepDistances(run.result.reachable, run.result.startPos, run.result.ledges);
  const inArea = group.size > 1;
  const exits: SimExit[] = [];
  const scores: number[] = [];
  for (const crossing of [...crossings.edges, ...crossings.entrances]) {
    if (!takeableCrossing(crossing)) continue;
    const ordered = overworldExitFor(crossing, pass);
    if (!ordered) continue;
    exits.push(ordered.exit);
    const base = ordered.exit.fromTile ? distanceAt(dist, ordered.exit.fromTile) : UNREACHED;
    scores.push(base + (inArea && ordered.leavesArea ? AREA_EXIT_BIAS : 0));
  }
  return { flood: summarizeRun(run, items), exits: dedupe(sortExitsByDistance(exits, scores)), reached: reachedGrid(run.result.reachable) };
};

/**
 * A screen's flood numbers plus the game-driven exits the run traverses on —
 * the ONLY exit source the simulator has, with no static connection data behind
 * it.
 *
 * A synthetic id the dataset does not define still names a real room, so it is
 * detected from its number — better a room with real geometry and a coarse name
 * than a hole in the graph.
 */
const detectScreenExits = (screenId: string, opts?: { entryTile?: GridPos; items?: TileReq[] }): DetectedScreen | null => {
  const items = opts?.items ?? ['lift.1'];
  // ONE resolution for both vocabularies. A second copy reading the overworld
  // index out of `roomIndex` — which an overworld record does not carry — sends
  // every dataset-id overworld detection to screen 0.
  const loc = locationForScreen(screenId);
  if (!loc) return null;
  return loc.isIndoors
    ? detectRoom(loc.roomId, items, opts?.entryTile, screenId)
    : detectOverworld(loc.owScreenIndex, items, opts?.entryTile, screenId);
};

export { detectScreenExits };
export type { DetectedScreen };
