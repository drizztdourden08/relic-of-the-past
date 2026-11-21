/* @layer renderer-app @kind types */
type SessionSwitchKey = 'session.deathLink' | 'session.trackOtherPlayers';

import type { Message } from '@drizztdourden08/brock-core/i18n';

interface SessionSwitch {
  field: 'deathLink' | 'trackOtherPlayers';
  fallback: boolean;
  label: Message;
  description: Message;
  hint: Message;
}

interface OnlineSessionToggleProps {
  settingKey: SessionSwitchKey;
  disabled: boolean;
}

export type { OnlineSessionToggleProps, SessionSwitch, SessionSwitchKey };
