/* @layer renderer-app @kind constants */
import type { BrockAppSettings } from '@drizztdourden08/brock-react';
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
};

export { SETTINGS };
