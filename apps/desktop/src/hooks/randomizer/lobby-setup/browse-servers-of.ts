/* @layer renderer-lib @kind logic */
import { LOBBY_DEFAULT_PORT } from '@rotp/randomizer';
import type { LanServer } from '@rotp/randomizer';
import { connectModeOf } from './connect-mode-of';
import { LOCAL_HOST } from './lobby-draft.constants';
import type { LobbyDraft } from './lobby-draft.type';

const browseServersOf = (draft: LobbyDraft, lan: readonly LanServer[]): string[] => {
  if (connectModeOf(draft) !== 'auto') return [];
  if (draft.location === 'local') return [`${LOCAL_HOST}:${LOBBY_DEFAULT_PORT}`];
  return lan.filter((server) => server.compatible).map((server) => `${server.address}:${server.port}`);
};

export { browseServersOf };
