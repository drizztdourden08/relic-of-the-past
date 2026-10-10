/* @layer bridge-wasm @kind logic */
import type { ConnectionInfo, CrossingSpan, GridPos, ScreenCrossing } from '@rotp/game-core';
import { wasmGetToggleFloorPositions } from '@rotp/game-core';
import { alongEdge, exitFromEdge } from '../../simulator/exit-order';
import type { EdgeName } from '../../simulator/exit-order';
import { overworldTarget, roomTarget } from '../resolve-target';
import { makeCrossing } from '../make-crossing';
import { togglesLayer } from '../layer-toggle';
import type { TogglePosition } from '../layer-toggle.type';
import type { CrossingPass } from '../crossings.type';
import { INTRA_FAR, INTRA_NEAR } from './edges.constants';

const spanOf = (positions: readonly number[]): string =>
  positions.length === 0 ? '?' : `${Math.min(...positions)}-${Math.max(...positions)}`;

const spanFor = (conn: ConnectionInfo): CrossingSpan | undefined =>
  conn.positions.length === 0 ? undefined : {
    from: Math.min(...conn.positions),
    to: Math.max(...conn.positions),
    freeTiles: conn.freeTileCount,
    itemTiles: conn.itemTileCount,
  };

const midOf = (positions: readonly number[]): number =>
  positions[Math.floor(positions.length / 2)] ?? 32;

const intraFromEdge = (edge: EdgeName, pos: number): GridPos =>
  alongEdge(edge, pos, { north: INTRA_FAR, south: INTRA_NEAR, west: INTRA_FAR, east: INTRA_NEAR });

const toggleTiles = (pass: CrossingPass): readonly TogglePosition[] =>
  pass.scope.isIndoors ? wasmGetToggleFloorPositions() : [];

const edgeCrossings = (pass: CrossingPass, connections: readonly ConnectionInfo[]): ScreenCrossing[] => {
  const toggles = toggleTiles(pass);
  return connections.map((conn) => {
    const label = spanOf(conn.positions);
    const mid = midOf(conn.positions);
    const span = spanFor(conn);
    return makeCrossing(pass, {
      id: `edge:${conn.edge}:${label}`,
      class: 'edge',
      kind: 'edge',
      origin: pass.scope.isIndoors ? 'room-border' : 'ow-border',
      tile: conn.isIntraRoom ? intraFromEdge(conn.edge, mid) : exitFromEdge(conn.edge, mid),
      side: conn.edge,
      target: pass.scope.isIndoors ? roomTarget(conn.targetScreen) : overworldTarget(conn.targetScreen),
      edgeSig: `${conn.edge}:${label}`,
      requirements: conn.requirements,
      ...(span ? { span } : {}),
      ...(togglesLayer(conn.edge, conn.positions, toggles) ? { layerToggle: true } : {}),
      ...(conn.isIntraRoom ? { isIntraRoom: true } : {}),
    });
  });
};

export { edgeCrossings };
