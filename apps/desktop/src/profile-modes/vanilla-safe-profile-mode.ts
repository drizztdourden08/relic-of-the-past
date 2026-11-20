/* @layer renderer-app @kind logic */
import type { ProfileModeDef } from '@drizztdourden08/brock-react';
import { MODE_BADGE_MESSAGES, MODE_BADGE_MONOGRAMS } from '@app/compounds/ModeBadge';
import { textOf } from '@app/shell/text-bridge';

const vanillaSafeProfileMode: ProfileModeDef = {
  id: 'vanilla-safe',
  get label() { return textOf(MODE_BADGE_MESSAGES['vanilla-safe']); },
  monogram: MODE_BADGE_MONOGRAMS['vanilla-safe'],
  rank: 110,
  matches: (profile, config) => !profile.randomizer && config?.vanillaSafe === true,
};

export { vanillaSafeProfileMode };
