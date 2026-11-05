/* @layer renderer-lib @kind logic */
import type { LobbyRef } from '@drizztdourden08/brock-randomizer/archipelago';
import { connectModeOf } from './connect-mode-of';
import type { LobbyDraft } from './lobby-draft.type';
import { REF_STRATEGIES } from './lobby-ref-of.constants';

const lobbyRefOf = (draft: LobbyDraft): LobbyRef | null => REF_STRATEGIES[connectModeOf(draft)](draft);

export { lobbyRefOf };
