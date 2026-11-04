/* @layer renderer-components @kind logic */
import type { RandomizerFormState } from '../../build-randomizer-config';

const needsConnection = (randomizer: RandomizerFormState, experimental: boolean): boolean =>
  randomizer.enabled && (randomizer.mode === 'archipelia' || (randomizer.mode === 'online' && experimental));

export { needsConnection };
