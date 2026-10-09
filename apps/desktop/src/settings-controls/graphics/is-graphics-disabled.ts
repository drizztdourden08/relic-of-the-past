/* @layer renderer-components @kind logic */
import type { GameSettings } from '@rotp/features';

const isGraphicsSettingDisabled = (key: string, settings: GameSettings): boolean => {
  if (key === 'linearFiltering') return settings.pixelPerfect;
  if (key === 'enhancedMode7' || key === 'noSpriteLimits') return settings.vanillaSafe;
  return false;
};

export { isGraphicsSettingDisabled };
