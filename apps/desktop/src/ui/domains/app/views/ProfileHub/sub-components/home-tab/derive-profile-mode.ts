/* @layer renderer-components @kind logic */
import type { ProfileModeId } from '../../../../compounds/ModeBadge';
import type { ProfileRandomizerConfig } from '@shared/types/profile';

const deriveProfileMode = (
  randomizer: ProfileRandomizerConfig | undefined,
  vanillaSafe: boolean,
): ProfileModeId => {
  if (randomizer) return randomizer.mode === 'online' ? 'randomizer-online' : 'randomizer';
  return vanillaSafe ? 'vanilla-safe' : 'vanilla';
};

export { deriveProfileMode };
