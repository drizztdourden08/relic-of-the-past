/* @layer renderer-app @kind constants */
import type { SessionSwitch, SessionSwitchKey } from './online.type';

const SESSION_ITEMS: Readonly<Record<SessionSwitchKey, SessionSwitch>> = {
  'session.deathLink': {
    field: 'deathLink',
    fallback: false,
    label: 'DeathLink',
    description: 'Dying takes down the other DeathLink players, and their deaths take you down.',
    hint: 'The session reconnects to apply it.',
  },
  'session.trackOtherPlayers': {
    field: 'trackOtherPlayers',
    fallback: true,
    label: 'Track Other Players',
    description: "Follow the other players' checks on the Network page.",
    hint: 'The session reconnects to apply it.',
  },
};

export { SESSION_ITEMS };
