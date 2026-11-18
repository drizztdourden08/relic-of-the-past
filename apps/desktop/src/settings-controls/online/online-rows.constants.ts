/* @layer renderer-app @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { SessionSwitch, SessionSwitchKey } from './online.type';

const SESSION_ITEMS: Readonly<Record<SessionSwitchKey, SessionSwitch>> = {
  'session.deathLink': {
    field: 'deathLink',
    fallback: false,
    label: msg('settings-online:session.death-link.label'),
    description: msg('settings-online:session.death-link.description'),
    hint: msg('settings-online:session.death-link.hint'),
  },
  'session.trackOtherPlayers': {
    field: 'trackOtherPlayers',
    fallback: true,
    label: msg('settings-online:session.track-other-players.label'),
    description: msg('settings-online:session.track-other-players.description'),
    hint: msg('settings-online:session.track-other-players.hint'),
  },
};

export { SESSION_ITEMS };
