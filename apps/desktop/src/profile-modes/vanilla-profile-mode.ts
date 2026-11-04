/* @layer renderer-app @kind logic */
import type { ProfileModeDef } from '@drizztdourden08/brock-react';
import { MODE_BADGE_LABELS, MODE_BADGE_MONOGRAMS } from '@app/compounds/ModeBadge';

const vanillaProfileMode: ProfileModeDef = {
  id: 'vanilla',
  label: MODE_BADGE_LABELS.vanilla,
  monogram: MODE_BADGE_MONOGRAMS.vanilla,
  rank: 100,
  matches: (profile) => !profile.randomizer,
};

export { vanillaProfileMode };
