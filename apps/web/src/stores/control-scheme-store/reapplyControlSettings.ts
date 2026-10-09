/* @layer renderer-stores @kind logic */
import { controlSettingsMemo } from './controlSettingsMemo';
import { refreshControlSettings } from './refreshControlSettings';

const reapplyControlSettings = (): void => {
  controlSettingsMemo.lastApplied = null;
  refreshControlSettings();
};

export { reapplyControlSettings };
