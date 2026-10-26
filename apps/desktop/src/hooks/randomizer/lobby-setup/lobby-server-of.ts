/* @layer renderer-lib @kind logic */
import { LOBBY_DEFAULT_PORT } from '@rotp/randomizer';
import type { LanServer } from '@rotp/randomizer';
import { LOCAL_HOST } from './lobby-draft.constants';
import type { LobbyDraft } from './lobby-draft.type';
import { remoteAddressOf } from './remote-address-of';

const lobbyServerOf = (draft: LobbyDraft, servers: readonly LanServer[]): string | null => {
  if (draft.location === 'local') return `${LOCAL_HOST}:${LOBBY_DEFAULT_PORT}`;
  if (draft.location === 'remote') return remoteAddressOf(draft.address);
  const server = servers.find((candidate) => candidate.id === draft.lanId);
  return server === undefined ? null : `${server.address}:${server.port}`;
};

export { lobbyServerOf };
