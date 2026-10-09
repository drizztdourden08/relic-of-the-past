/* @layer bridge-wasm @kind logic */
import type { ConnectionInfo } from '@shared/game/navigation';

const spanOf = (positions: readonly number[]): string =>
  positions.length === 0 ? '?' : `${Math.min(...positions)}-${Math.max(...positions)}`;

const connectionCrossingId = (connection: ConnectionInfo): string =>
  `edge:${connection.edge}:${spanOf(connection.positions)}`;

export { connectionCrossingId };
