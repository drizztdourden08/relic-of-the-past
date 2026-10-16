/* @layer renderer-components @kind logic */
import type { ProfileModeId } from '@app/compounds/ModeBadge';

const modeOf = (profile: Profile, settings: Record<string, unknown> | null): ProfileModeId => {
  const { randomizer } = profile;
  if (randomizer) return randomizer.mode === 'online' ? 'randomizer-online' : 'randomizer';
  return settings?.vanillaSafe === true ? 'vanilla-safe' : 'vanilla';
};

export { modeOf };
