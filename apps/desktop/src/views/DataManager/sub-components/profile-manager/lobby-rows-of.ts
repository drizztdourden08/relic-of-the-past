/* @layer renderer-components @kind logic */
import { LOBBY_DEFAULT_PORT } from '@rotp/randomizer';
import type { LanServer } from '@rotp/randomizer';
import type { LobbyRow } from '@app/compounds/LobbySetup';
import { LOCAL_HOST, LOCAL_LOBBY_ID } from '@app/hooks/randomizer/lobby-setup';
import type { LobbyLocation } from '@app/hooks/randomizer/lobby-setup';

const LOCAL_ROW: LobbyRow = {
  id: LOCAL_LOBBY_ID,
  name: 'Local lobby server',
  address: `${LOCAL_HOST}:${LOBBY_DEFAULT_PORT}`,
  supported: true,
  open: true,
};

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
