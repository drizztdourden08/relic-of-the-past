/* @layer renderer-components @kind types */
import type { ServerSetupDraft } from '@app/hooks/randomizer/server-setup/server-setup-draft';
import type { ServerProbe } from '@app/hooks/randomizer/server-setup/useServerProbe';
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@shared/types/profile';

interface ConnectionFormParams {
  config: ProfileRandomizerConfig;
  onSave: (patch: RandomizerConnectionPatch) => Promise<void>;
}

interface ConnectionForm {
  draft: ServerSetupDraft;
  dirty: boolean;
  error: string | null;
  saving: boolean;
  probe: ServerProbe;
  change: (part: Partial<ServerSetupDraft>) => void;
  changeHost: (host: string) => void;
  settleHost: () => void;
  revert: () => void;
  save: () => Promise<void>;
}

export type { ConnectionForm, ConnectionFormParams };
