/* @layer renderer-app @kind logic */
import type { SettingLockCause } from '@drizztdourden08/brock-react';
import type { GameSettings } from '@rotp/features';
import { DEVELOPER_GATED_KEYS } from './contributing.constants';

const developerLockCause = (key: string, settings: GameSettings): SettingLockCause | null =>
  DEVELOPER_GATED_KEYS.includes(key) && settings.developerToolsEnabled !== true ? 'developerTools' : null;

export { developerLockCause };
