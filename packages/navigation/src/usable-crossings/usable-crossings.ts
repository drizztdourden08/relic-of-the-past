/* @layer bridge-wasm @kind logic */
import type { ConnectionInfo, ScreenCrossings } from '@rotp/game-core';
import type { CrossingFilterScope } from './usable-crossings.type';
import { blockedSpots } from './blocked-spots';
import { connectionCrossingId } from './connection-crossing-id';
import { edgeUsable } from './edge-usable';
import { floodEntranceIdOf } from './flood-entrance-id-of';
import { gatedEntranceIds } from './gated-entrance-ids';

const bundlesById = (connections: readonly ConnectionInfo[]): Map<string, ConnectionInfo> => {
  const map = new Map<string, ConnectionInfo>();
  for (const connection of connections) {
    if (!map.has(connectionCrossingId(connection))) map.set(connectionCrossingId(connection), connection);
  }
  return map;
};

const usableCrossings = (crossings: ScreenCrossings, scope: CrossingFilterScope): ScreenCrossings => {
  const bundles = bundlesById(scope.connections);
  const blocked = scope.isIndoors ? blockedSpots(scope.roomIndex) : [];
  const gated = scope.flood ? gatedEntranceIds(scope.flood, scope.items ?? scope.flood.items ?? []) : null;
  return {
    ...crossings,
    entrances: crossings.entrances.filter((crossing) => {
      const id = floodEntranceIdOf(crossing, scope.isIndoors);
      return !(gated && id !== null && gated.has(id));
    }),
    edges: crossings.edges.filter((crossing) => edgeUsable(crossing, bundles, scope, blocked)),
  };
};

export { usableCrossings };
