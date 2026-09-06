/* @layer renderer-components @kind logic */
/**
 * Which play mode a profile is in, for the home summary's badge and mode fact.
 * Randomizer config wins (it is frozen at creation and cannot be turned off);
 * the vanilla-safe setting splits the rest into safe and plain vanilla.
 */
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
