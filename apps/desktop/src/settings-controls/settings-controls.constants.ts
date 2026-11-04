/* @layer renderer-app @kind constants */
import { isSettingDisabled } from './is-setting-disabled';
import { lockOverlay } from './lock-overlay';
import { renderSettingControl } from './render-setting-control';
import type { SettingsControls } from './settings-controls.type';

const SETTINGS_CONTROLS: SettingsControls = {
  renderControl: renderSettingControl,
  isDisabled: isSettingDisabled,
  lockOverlay,
};

export { SETTINGS_CONTROLS };
