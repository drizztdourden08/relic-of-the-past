/* @layer renderer-stores @kind types */
import type { ProfileRandomizerConfig } from '@app/profiles/types';

interface ProfileConnectionState {
  saved: Readonly<Record<string, ProfileRandomizerConfig>>;
  setSaved: (profileId: string, config: ProfileRandomizerConfig) => void;
}

export type { ProfileConnectionState };
