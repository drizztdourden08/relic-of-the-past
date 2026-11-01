/* @layer bridge-wasm @kind logic */
import type { ConnectionInfo } from '@rotp/game-core';
import { connectionCrossingId } from '@rotp/navigation';

const bundlesOf = (connections: readonly ConnectionInfo[]): Map<string, ConnectionInfo> => {
  const bundles = new Map<string, ConnectionInfo>();
  for (const connection of connections) bundles.set(connectionCrossingId(connection), connection);
  return bundles;
};

export { bundlesOf };
