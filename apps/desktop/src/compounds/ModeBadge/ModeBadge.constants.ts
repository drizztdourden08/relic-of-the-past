/* @layer renderer-components @kind constants */
import type { ProfileModeId } from './ModeBadge.type';

const MODE_BADGE_LABELS: Record<ProfileModeId, string> = {
  'vanilla': 'Vanilla',
  'vanilla-safe': 'Vanilla Safe',
  'randomizer': 'Randomizer',
  'randomizer-online': 'Archipelago Randomizer',
};

const MODE_BADGE_MONOGRAMS: Record<ProfileModeId, string> = {
  'vanilla': 'V',
  'vanilla-safe': 'VS',
  'randomizer': 'R',
  'randomizer-online': 'RO',
};

export { MODE_BADGE_LABELS, MODE_BADGE_MONOGRAMS };
