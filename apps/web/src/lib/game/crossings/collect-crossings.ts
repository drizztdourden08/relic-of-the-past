/* @layer bridge-wasm @kind logic */
import { getConnections } from '@shared/game/navigation';
import type { ScreenCrossing, ScreenCrossings } from '@shared/game/navigation';
import type { ConnectionInfo } from '@shared/game/navigation';
import { stepDistances } from '../simulator/exit-order';
import { overworldTarget, roomTarget } from './resolve-target';
import { indoorSpawnCrossings } from './sources/indoor-spawns';
import { indoorTableCrossings } from './sources/indoor-tables';
import { doorwayCrossings, warpCrossings } from './sources/indoor-doors';
import { exitTableCrossing } from './sources/exit-table';
import { outdoorEntranceCrossings } from './sources/outdoor-entrances';
import { edgeCrossings } from './sources/edges';
import type { CrossingPass, CrossingScope } from './crossings.type';

const buildPass = (scope: CrossingScope): CrossingPass => {
  const flood = scope.flood;
  return {
    scope,
    items: scope.items ?? flood?.items ?? [],
    ...(flood ? { reachable: flood.reachable } : {}),
    ...(flood ? { dist: stepDistances(flood.reachable, flood.startPos, flood.ledges) } : {}),
  };
};

/**
 * Border bundles for the pass. A caller holding the widget's own connections
 * passes them, which is the only way intra-room scrolls arrive — deriving them
 * needs the room's scroll boundary, which the flood result does not carry.
 */
const connectionsFor = (scope: CrossingScope): readonly ConnectionInfo[] => {
  if (scope.connections) return scope.connections;
  return scope.flood ? getConnections(scope.flood) : [];
};

const indoorCrossings = (pass: CrossingPass): ScreenCrossing[] => [
  ...indoorSpawnCrossings(pass),
  ...indoorTableCrossings(pass),
  ...warpCrossings(pass),
  ...doorwayCrossings(pass),
  ...exitTableCrossing(pass),
];

/** One record per crossing id; a door read from two tables is still one door. */
const byId = (crossings: readonly ScreenCrossing[]): ScreenCrossing[] => {
  const seen = new Map<string, ScreenCrossing>();
  for (const crossing of crossings) {
    if (!seen.has(crossing.id)) seen.set(crossing.id, crossing);
  }
  return [...seen.values()];
};

/**
 * THE producer of every way on or off one screen. Nothing is filtered out for
 * being unusable: a crossing the player cannot take is emitted with
 * `available: false` and the requirements it asks for.
 */
const collectCrossings = (scope: CrossingScope): ScreenCrossings => {
  const pass = buildPass(scope);
  const here = scope.isIndoors ? roomTarget(scope.roomIndex) : overworldTarget(scope.owScreenIndex);
  const entrances = scope.isIndoors ? indoorCrossings(pass) : outdoorEntranceCrossings(pass);
  return {
    screenId: here.target.screenId,
    screenIndex: scope.isIndoors ? scope.roomIndex : scope.owScreenIndex,
    entrances: byId(entrances),
    edges: byId(edgeCrossings(pass, connectionsFor(scope))),
  };
};

export { collectCrossings };
