/* @layer renderer-lib @kind types */
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@shared/types/profile';

interface ProfileConnection {
  config: ProfileRandomizerConfig | null;
  saveConnection: (patch: RandomizerConnectionPatch) => Promise<void>;
}

export type { ProfileConnection };
