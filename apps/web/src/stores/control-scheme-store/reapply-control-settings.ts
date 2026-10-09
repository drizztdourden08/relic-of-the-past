/* @layer renderer-stores @kind logic */
import { controlSettingsMemo } from './control-settings-memo';
import { refreshControlSettings } from './refresh-control-settings';

const reapplyControlSettings = (): void => {
  controlSettingsMemo.lastApplied = null;
  refreshControlSettings();
};

export { reapplyControlSettings };
