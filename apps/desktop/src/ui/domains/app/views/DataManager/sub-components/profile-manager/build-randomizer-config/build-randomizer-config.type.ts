/* @layer renderer-components @kind types */
import type { ServerSetupDraft } from '@app/hooks/randomizer/server-setup/server-setup-draft';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';

interface RandomizerFormState extends RandomizerOptionChoices {
  enabled: boolean;
  seed: string;
  mode: 'local' | 'online';
  server: ServerSetupDraft;
  deathLink: boolean;
  trackOtherPlayers: boolean;
}

export type { RandomizerFormState };
