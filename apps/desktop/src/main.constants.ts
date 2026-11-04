/* @layer renderer-app @kind constants */
import { developerToolsFromSettings, volumeFromSettings } from '@drizztdourden08/brock-react';
import type { BrockAppSettings } from '@drizztdourden08/brock-react';
import { LOCK_CAUSE_PROVIDERS } from './settings-controls/lock-causes';
import { SETTINGS_CONTROLS } from './settings-controls/settings-controls.constants';
import { normaliseSettings } from './settings-effects/normalise-settings';
import { transformSettingsPatch } from './settings-effects/transform-settings-patch';
import { DEFAULT_SETTINGS } from './settings.constants';
import type { AppSettings } from './settings.type';

const SETTINGS: BrockAppSettings<AppSettings> = {
  defaults: DEFAULT_SETTINGS,
  normalise: normaliseSettings,
  transformPatch: transformSettingsPatch,
  ...SETTINGS_CONTROLS,
  lockCauses: LOCK_CAUSE_PROVIDERS,
};

const VOLUME = volumeFromSettings({ value: 'masterVolume', muted: 'masterMuted', max: 100 });

const DEVELOPER_TOOLS = developerToolsFromSettings('developerToolsEnabled');

export { DEVELOPER_TOOLS, SETTINGS, VOLUME };
