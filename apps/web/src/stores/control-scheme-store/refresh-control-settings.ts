/* @layer renderer-stores @kind logic */
import { liveSettingsNow } from '@app/lib/game/live-settings';
import { controlSettingsMemo } from './control-settings-memo';
import { syncControlSettings } from './sync-control-settings';

const refreshControlSettings = (): void => {
  const settings = liveSettingsNow();
  if (!settings || settings === controlSettingsMemo.lastApplied) return;
  controlSettingsMemo.lastApplied = settings;
  syncControlSettings(settings);
};

export { refreshControlSettings };
