/* @layer renderer-components @kind types */
import type { GameSettings } from '@shared/types/settings';
import type { SettingItem } from '../../../compounds/SettingsLayout';

type SessionSwitchKey = 'session.deathLink' | 'session.trackOtherPlayers';

interface SessionSwitch extends Omit<SettingItem, 'key'> {
  field: 'deathLink' | 'trackOtherPlayers';
  fallback: boolean;
}

interface OnlineSettingsProps {
  profile: Profile | null;
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

export type { OnlineSettingsProps, SessionSwitch, SessionSwitchKey };
