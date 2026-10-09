/* @layer renderer-components @kind logic */
import type { GameSettings, HapticSettings } from '@rotp/features';

const hapticPatch = (settings: GameSettings, field: keyof HapticSettings, value: boolean | number): Partial<GameSettings> => {
  return {
    haptics: {
      ...settings.haptics,
      [field]: value,
    },
  };
};

export { hapticPatch };
