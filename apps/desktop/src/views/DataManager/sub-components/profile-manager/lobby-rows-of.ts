/* @layer renderer-components @kind logic */
import type { BrowsedEntry } from '@app/game/archipelia';
import type { LobbyRow } from '@app/compounds/LobbySetup';

const seatsOf = ({ free, total }: BrowsedEntry['lobby']['seats']): string => `${String(free)} of ${String(total)} seats free`;

const lobbyRowsOf = (entries: readonly BrowsedEntry[], versions: readonly string[]): LobbyRow[] =>
  entries.map(({ server, lobby }) => ({
    id: lobby.joinToken,
    name: lobby.name,
    address: server,
    ap: lobby.engine.ap,
    supported: versions.includes(lobby.engine.ap),
    open: lobby.joinable,
    seats: seatsOf(lobby.seats),
  }));

export { lobbyRowsOf };
