/* @layer renderer-components @kind logic */
import { MODE_OF_RANDOMIZER } from '../../../../compounds/ModeBadge';
import type { ProfileModeId } from '../../../../compounds/ModeBadge';
import type { ProfileRandomizerConfig } from '@app/profiles/types';

const deriveProfileMode = (
  randomizer: ProfileRandomizerConfig | undefined,
  vanillaSafe: boolean,
): ProfileModeId => {
  if (randomizer) return MODE_OF_RANDOMIZER[randomizer.mode];
  return vanillaSafe ? 'vanilla-safe' : 'vanilla';
};

export { deriveProfileMode };
