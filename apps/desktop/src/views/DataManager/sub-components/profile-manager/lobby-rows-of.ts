/* @layer renderer-components @kind logic */
import type { LanServer } from '@rotp/randomizer';
import type { LobbyRow } from '@app/compounds/LobbySetup';
import type { LobbyLocation } from '@app/hooks/randomizer/lobby-setup';
import { LOCAL_ROW } from './lobby-rows-of.constants';

const lobbyRowsOf = (location: LobbyLocation, servers: readonly LanServer[], versions: readonly string[]): LobbyRow[] =>
  (location === 'local'
    ? [LOCAL_ROW]
    : servers.map((server) => ({
      id: server.id,
      name: server.name,
      address: `${server.address}:${server.port}`,
      ap: server.archipelagoVersion,
      supported: server.compatible && versions.includes(server.archipelagoVersion),
      open: server.open,
    })));

export { lobbyRowsOf };
