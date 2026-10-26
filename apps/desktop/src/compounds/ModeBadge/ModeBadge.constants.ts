/* @layer renderer-components @kind constants */
import type { ProfileModeId } from './ModeBadge.type';

const MODE_BADGE_LABELS: Record<ProfileModeId, string> = {
  'vanilla': 'Vanilla',
  'vanilla-safe': 'Vanilla Safe',
  'randomizer': 'Randomizer',
  'randomizer-online': 'Archipelago Randomizer',
  'randomizer-archipelia': 'Archipelia',
};

const MODE_BADGE_MONOGRAMS: Record<ProfileModeId, string> = {
  'vanilla': 'V',
  'vanilla-safe': 'VS',
  'randomizer': 'R',
  'randomizer-online': 'RO',
  'randomizer-archipelia': 'AL',
};

const MODE_OF_RANDOMIZER: Readonly<Record<'local' | 'online' | 'archipelia', ProfileModeId>> = {
  local: 'randomizer',
  online: 'randomizer-online',
  archipelia: 'randomizer-archipelia',
};

export { MODE_BADGE_LABELS, MODE_BADGE_MONOGRAMS, MODE_OF_RANDOMIZER };
