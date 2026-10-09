/* @layer renderer-app @kind types */
type SessionSwitchKey = 'session.deathLink' | 'session.trackOtherPlayers';

interface SessionSwitch {
  field: 'deathLink' | 'trackOtherPlayers';
  fallback: boolean;
  label: string;
  description: string;
  hint: string;
}

interface OnlineSessionToggleProps {
  settingKey: SessionSwitchKey;
  disabled: boolean;
}

export type { OnlineSessionToggleProps, SessionSwitch, SessionSwitchKey };
