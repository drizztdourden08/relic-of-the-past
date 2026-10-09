/* @layer renderer-lib @kind types */
import type { ProfileRandomizerConfig } from '@shared/types/profile';

interface ServerSetupDraft {
  host: string;
  port: string;
  password: string;
  slotName: string;
}

type ConnectionFields = Pick<ProfileRandomizerConfig, 'serverUrl' | 'slotName' | 'password'>;

export type { ConnectionFields, ServerSetupDraft };
