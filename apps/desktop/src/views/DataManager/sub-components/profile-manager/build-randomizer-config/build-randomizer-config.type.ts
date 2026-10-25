/* @layer renderer-components @kind types */
import type { LobbyCheck } from '@app/game/archipelia';
import type { LobbyDraft } from '@app/hooks/randomizer/lobby-setup';
import type { ServerSetupDraft } from '@app/hooks/randomizer/server-setup/server-setup-draft';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';

interface RandomizerFormState extends RandomizerOptionChoices {
  enabled: boolean;
  seed: string;
  mode: 'local' | 'online' | 'archipelia';
  server: ServerSetupDraft;
  lobby: LobbyDraft;
  lobbyCheck: LobbyCheck;
}

export type { RandomizerFormState };
