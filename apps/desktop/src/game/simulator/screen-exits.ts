/* @layer bridge-wasm @kind logic */
import type { GridPos, ScreenCrossing } from '@rotp/game-core';
import type { TileReq } from '@rotp/game-data';
import type { SimExit, DetectedScreen, OrderedExit, OverworldExitPass } from '@rotp/navigation';
import { computeBigScreenGroup } from '@app/nav-widget/widget-helpers';
import { bundlesOf } from './bundles-of';
import { roomOf } from './crossing-room-of';
import { screenOf } from './crossing-screen-of';
import { tailNumber } from './crossing-tail-number';
import { collectCrossings, midOf, takeableCrossing, usableCrossings, floodOneOverworld, summarizeRun, stepDistances, distanceAt, sortExitsByDistance, entryFromEdge, reachedGrid, AREA_EXIT_BIAS, dedupe, locationForScreen, SCREEN_EXIT_UNREACHED } from '@rotp/navigation';
import { owScreenId, interiorScreenId, spawnTile, screenAreaInfo } from './screen-resolve';
import { detectRoom } from './room-exits';

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

const detectOverworld = (screenIndex: number, items: TileReq[], entryTile?: GridPos, fromKey = `ow:${screenIndex}`): DetectedScreen | null => {
  const run = floodOneOverworld(screenIndex, items, entryTile);
  if (!run) return null;
  const scope = {
    isIndoors: false, roomIndex: 0, owScreenIndex: screenIndex,
    flood: run.result, connections: run.connections, items,
  };
  const crossings = usableCrossings(collectCrossings(scope), scope);
  const group = new Set(computeBigScreenGroup(screenIndex));
  const pass: OverworldExitPass = { fromKey, bundles: bundlesOf(run.connections), group };
  const dist = stepDistances(run.result.reachable, run.result.startPos, run.result.ledges);
  const inArea = group.size > 1;
  const exits: SimExit[] = [];
  const scores: number[] = [];
  for (const crossing of [...crossings.edges, ...crossings.entrances]) {
    if (!takeableCrossing(crossing)) continue;
    const ordered = overworldExitFor(crossing, pass);
    if (!ordered) continue;
    exits.push(ordered.exit);
    const base = ordered.exit.fromTile ? distanceAt(dist, ordered.exit.fromTile) : SCREEN_EXIT_UNREACHED;
    scores.push(base + (inArea && ordered.leavesArea ? AREA_EXIT_BIAS : 0));
  }
  return { flood: summarizeRun(run, items), exits: dedupe(sortExitsByDistance(exits, scores)), reached: reachedGrid(run.result.reachable) };
};

const detectScreenExits = (screenId: string, opts?: { entryTile?: GridPos; items?: TileReq[] }): DetectedScreen | null => {
  const items = opts?.items ?? ['lift.1'];
  const loc = locationForScreen(screenId);
  if (!loc) return null;
  return loc.isIndoors
    ? detectRoom(loc.roomId, items, opts?.entryTile, screenId)
    : detectOverworld(loc.owScreenIndex, items, opts?.entryTile, screenId);
};

export { detectScreenExits };
