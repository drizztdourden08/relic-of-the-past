/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';

const isHapticsSettingDisabled = (key: string, settings: GameSettings): boolean => {
  if (key === 'haptics.enabled') return false;
  return !settings.haptics.enabled;
};

export { isHapticsSettingDisabled };
