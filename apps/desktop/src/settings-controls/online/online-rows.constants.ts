/* @layer renderer-app @kind constants */
import type { SessionSwitch, SessionSwitchKey } from './online.type';

const SESSION_ITEMS: Readonly<Record<SessionSwitchKey, SessionSwitch>> = {
  'session.deathLink': { field: 'deathLink', fallback: false, label: 'DeathLink' },
  'session.trackOtherPlayers': { field: 'trackOtherPlayers', fallback: true, label: 'Track Other Players' },
};

export { SESSION_ITEMS };
