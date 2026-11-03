/* @layer renderer-lib @kind logic */
import type { LanServer } from '@rotp/randomizer';
import { connectModeOf } from './connect-mode-of';
import type { LobbyDraft } from './lobby-draft.type';
import { SERVER_STRATEGIES } from './lobby-server-of.constants';

const lobbyServerOf = (draft: LobbyDraft, servers: readonly LanServer[]): string | null =>
  SERVER_STRATEGIES[connectModeOf(draft)](draft, servers);

export { lobbyServerOf };
