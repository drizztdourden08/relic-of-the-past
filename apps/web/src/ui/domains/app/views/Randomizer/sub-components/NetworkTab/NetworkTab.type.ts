/* @layer renderer-components @kind types */
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@shared/types/profile';

interface NetworkTabProps {
  /** The profile's randomizer config: its connection is named and edited here. */
  config: ProfileRandomizerConfig | null;
  /** Writes the profile's connection and reconnects the session on it. */
  onSaveConnection: (patch: RandomizerConnectionPatch) => Promise<void>;
}

export type { NetworkTabProps };
