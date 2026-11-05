/* @layer renderer-app @kind types */
import type { LobbyCheck } from '@app/game/archipelia';
import type { LobbyDraft } from '@app/hooks/randomizer/lobby-setup';

interface RotpLobbyForm {
  lobby: LobbyDraft;
  lobbyCheck: LobbyCheck;
}

export type { RotpLobbyForm };
