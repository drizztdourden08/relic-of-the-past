/* @layer renderer-app @kind logic */
import type { ProfileModeDef } from '@drizztdourden08/brock-react';
import { MODE_BADGE_MESSAGES, MODE_BADGE_MONOGRAMS } from '@app/compounds/ModeBadge';
import { textOf } from '@app/shell/text-bridge';

const vanillaProfileMode: ProfileModeDef = {
  id: 'vanilla',
  get label() { return textOf(MODE_BADGE_MESSAGES.vanilla); },
  monogram: MODE_BADGE_MONOGRAMS.vanilla,
  rank: 100,
  matches: (profile) => !profile.randomizer,
};

export { vanillaProfileMode };
