/* @layer renderer-app @kind types */
import type { LobbyCheck } from '@drizztdourden08/brock-randomizer/renderer';
import type { LobbyDraft } from '@app/hooks/randomizer/lobby-setup';

interface RotpLobbyForm {
  lobby: LobbyDraft;
  lobbyCheck: LobbyCheck;
}

export type { RotpLobbyForm };
