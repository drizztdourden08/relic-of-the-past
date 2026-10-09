/* @layer renderer-components @kind types */
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@shared/types/profile';

interface NetworkTabProps {
  config: ProfileRandomizerConfig | null;
  onSaveConnection: (patch: RandomizerConnectionPatch) => Promise<void>;
}

export type { NetworkTabProps };
