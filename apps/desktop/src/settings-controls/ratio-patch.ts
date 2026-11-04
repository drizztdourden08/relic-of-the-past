/* @layer renderer-app @kind logic */
import type { GameSettings } from '@rotp/features';
import type { AspectRatioChange } from '@drizztdourden08/brock-display/renderer';

interface RatioKeys {
  ratio: 'aspectRatio' | 'hudRatio';
  w: 'customAspectW' | 'customHudAspectW';
  h: 'customAspectH' | 'customHudAspectH';
}

const ratioPatch = (change: AspectRatioChange, keys: RatioKeys): Partial<GameSettings> => ({
  [keys.ratio]: change.value,
  ...(change.customW !== undefined ? { [keys.w]: change.customW } : {}),
  ...(change.customH !== undefined ? { [keys.h]: change.customH } : {}),
});

export { ratioPatch };
export type { RatioKeys };
