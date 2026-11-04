/* @layer renderer-app @kind logic */
import type { ProfileModeDef } from '@drizztdourden08/brock-react';
import { MODE_BADGE_LABELS, MODE_BADGE_MONOGRAMS } from '@app/compounds/ModeBadge';

const vanillaSafeProfileMode: ProfileModeDef = {
  id: 'vanilla-safe',
  label: MODE_BADGE_LABELS['vanilla-safe'],
  monogram: MODE_BADGE_MONOGRAMS['vanilla-safe'],
  rank: 110,
  matches: (profile, config) => !profile.randomizer && config?.vanillaSafe === true,
};

export { vanillaSafeProfileMode };
