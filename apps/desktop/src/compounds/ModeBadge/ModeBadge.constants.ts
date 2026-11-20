/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { ProfileModeId } from './ModeBadge.type';

const MODE_BADGE_MESSAGES: Record<ProfileModeId, Message> = {
  'vanilla': msg('compounds:mode-badge.vanilla'),
  'vanilla-safe': msg('compounds:mode-badge.vanilla-safe'),
  'randomizer': msg('compounds:mode-badge.randomizer'),
  'randomizer-online': msg('compounds:mode-badge.randomizer-online'),
  'randomizer-archipelia': msg('compounds:mode-badge.randomizer-archipelia'),
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

export { MODE_BADGE_MESSAGES, MODE_BADGE_MONOGRAMS, MODE_OF_RANDOMIZER };
