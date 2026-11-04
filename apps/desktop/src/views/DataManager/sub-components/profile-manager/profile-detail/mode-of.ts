/* @layer renderer-components @kind logic */
import { MODE_OF_RANDOMIZER } from '@app/compounds/ModeBadge';
import type { ProfileModeId } from '@app/compounds/ModeBadge';
import { resolveProfileMode } from '@drizztdourden08/brock-react';
import { APP_PROFILE_MODES } from '@app/profile-modes';

const modeOf = (profile: Profile, settings: Record<string, unknown> | null): ProfileModeId => {
  const { randomizer } = profile;
  if (randomizer) return MODE_OF_RANDOMIZER[randomizer.mode];
  return (resolveProfileMode(APP_PROFILE_MODES, profile, settings)?.id ?? 'vanilla') as ProfileModeId;
};

export { modeOf };
