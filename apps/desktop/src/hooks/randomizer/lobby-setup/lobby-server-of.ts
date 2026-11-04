/* @layer renderer-lib @kind logic */
import { connectModeOf } from './connect-mode-of';
import type { LobbyDraft } from './lobby-draft.type';
import { SERVER_STRATEGIES } from './lobby-server-of.constants';

const lobbyServerOf = (draft: LobbyDraft): string | null => SERVER_STRATEGIES[connectModeOf(draft)](draft);

export { lobbyServerOf };
