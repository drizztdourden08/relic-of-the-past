/* @layer renderer-lib @kind logic */
import { LOBBY_DEFAULT_PORT } from '@rotp/randomizer';
import { LOCAL_HOST } from './lobby-draft.constants';
import type { ServerStrategy } from './lobby-server-of.type';

const foundServerOf: ServerStrategy = (draft, servers) => {
  if (draft.location === 'local') return `${LOCAL_HOST}:${LOBBY_DEFAULT_PORT}`;
  const server = servers.find((candidate) => candidate.id === draft.lobbyId);
  return server === undefined ? null : `${server.address}:${server.port}`;
};

export { foundServerOf };
