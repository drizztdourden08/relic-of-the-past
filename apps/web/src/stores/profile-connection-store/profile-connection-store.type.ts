/* @layer renderer-stores @kind types */
import type { ProfileRandomizerConfig } from '@shared/types/profile';

interface ProfileConnectionState {
  saved: Readonly<Record<string, ProfileRandomizerConfig>>;
  setSaved: (profileId: string, config: ProfileRandomizerConfig) => void;
}

export type { ProfileConnectionState };
