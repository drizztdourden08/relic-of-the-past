/* @layer bridge-wasm @kind logic */
import type { ConnectionInfo, CrossingSpan, GridPos, ScreenCrossing } from '@shared/game/navigation';
import { wasmGetToggleFloorPositions } from '../../';
import { exitFromEdge } from '../../simulator/exit-order';
import type { EdgeName } from '../../simulator/exit-order';
import { overworldTarget, roomTarget } from '../resolve-target';
import { makeCrossing } from '../make-crossing';
import { togglesLayer } from '../layer-toggle';
import type { TogglePosition } from '../layer-toggle';
import type { CrossingPass } from '../crossings.type';

/** A room's internal scroll boundary runs between rows/cols 31 and 32. */
const INTRA_NEAR = 31;
const INTRA_FAR = 32;

const spanOf = (positions: readonly number[]): string =>
  positions.length === 0 ? '?' : `${Math.min(...positions)}-${Math.max(...positions)}`;

/** The run of tiles the scroll occupies, and what each of them asks for. */
const spanFor = (conn: ConnectionInfo): CrossingSpan | undefined =>
  conn.positions.length === 0 ? undefined : {
    from: Math.min(...conn.positions),
    to: Math.max(...conn.positions),
    freeTiles: conn.freeTileCount,
    itemTiles: conn.itemTileCount,
  };

const midOf = (positions: readonly number[]): number =>
  positions[Math.floor(positions.length / 2)] ?? 32;

/**
 * Where an intra-room scroll physically sits, which is the quadrant boundary and
 * not the screen border: `getConnections` derives one of these from the
 * reachable pair at 31/32, so placing it at row 0/63 puts the marker ~31 tiles
 * from the scroll the player is standing on and reads it as out of reach.
 */
const intraFromEdge = (edge: EdgeName, pos: number): GridPos =>
  edge === 'north' ? { row: INTRA_FAR, col: pos }
  : edge === 'south' ? { row: INTRA_NEAR, col: pos }
  : edge === 'west' ? { row: pos, col: INTRA_FAR }
  : { row: pos, col: INTRA_NEAR };

/** Toggle-floor tiles apply to rooms only; the surface has one floor. */
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
