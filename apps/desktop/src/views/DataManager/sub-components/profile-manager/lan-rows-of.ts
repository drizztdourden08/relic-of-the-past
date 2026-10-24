/* @layer renderer-components @kind logic */
import type { LanServer } from '@rotp/randomizer';
import type { LanServerRow } from '@app/compounds/LobbySetup';

const lanRowsOf = (servers: readonly LanServer[], versions: readonly string[]): LanServerRow[] =>
  servers.map((server) => ({
    id: server.id,
    name: server.name,
    address: `${server.address}:${server.port}`,
    ap: server.archipelagoVersion,
    supported: server.compatible && versions.includes(server.archipelagoVersion),
    open: server.open,
  }));

export { lanRowsOf };
