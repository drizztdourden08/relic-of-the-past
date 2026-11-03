/* @layer renderer-lib @kind logic */
import { LOBBY_DEFAULT_PORT } from '@rotp/randomizer';
import type { LanServer } from '@rotp/randomizer';
import { connectModeOf } from './connect-mode-of';
import { LOCAL_HOST } from './lobby-draft.constants';
import type { LobbyConnect, LobbyDraft } from './lobby-draft.type';
import { remoteAddressOf } from './remote-address-of';

type ServerStrategy = (draft: LobbyDraft, servers: readonly LanServer[]) => string | null;

const foundServerOf: ServerStrategy = (draft, servers) => {
  if (draft.location === 'local') return `${LOCAL_HOST}:${LOBBY_DEFAULT_PORT}`;
  const server = servers.find((candidate) => candidate.id === draft.lobbyId);
  return server === undefined ? null : `${server.address}:${server.port}`;
};

const typedServerOf: ServerStrategy = (draft) => remoteAddressOf(draft.address);

const SERVER_STRATEGIES: Readonly<Record<LobbyConnect, ServerStrategy>> = {
  auto: foundServerOf,
  manual: typedServerOf,
};

const lobbyServerOf = (draft: LobbyDraft, servers: readonly LanServer[]): string | null =>
  SERVER_STRATEGIES[connectModeOf(draft)](draft, servers);

export { lobbyServerOf };
