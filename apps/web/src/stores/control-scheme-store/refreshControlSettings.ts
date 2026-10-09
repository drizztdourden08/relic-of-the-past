/* @layer renderer-stores @kind logic */
import { liveSettingsNow } from '@app/lib/game/live-settings';
import { controlSettingsMemo } from './controlSettingsMemo';
import { syncControlSettings } from './syncControlSettings';

const refreshControlSettings = (): void => {
  const settings = liveSettingsNow();
  if (!settings || settings === controlSettingsMemo.lastApplied) return;
  controlSettingsMemo.lastApplied = settings;
  syncControlSettings(settings);
};

export { refreshControlSettings };
