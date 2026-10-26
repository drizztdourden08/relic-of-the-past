/* @layer renderer-components @kind logic */
import { MODE_OF_RANDOMIZER } from '@app/compounds/ModeBadge';
import type { ProfileModeId } from '@app/compounds/ModeBadge';

const modeOf = (profile: Profile, settings: Record<string, unknown> | null): ProfileModeId => {
  const { randomizer } = profile;
  if (randomizer) return MODE_OF_RANDOMIZER[randomizer.mode];
  return settings?.vanillaSafe === true ? 'vanilla-safe' : 'vanilla';
};

export { modeOf };
