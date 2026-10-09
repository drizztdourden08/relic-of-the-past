/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { ENHANCED_CONFIG_OVERRIDES, VANILLA_CONFIG_OVERRIDES } from './profile-presets.data';
import type { ProfilePresetId } from './profile-presets.type';

const applyProfilePreset = (id: ProfilePresetId): Partial<GameSettings> =>
  (id === 'enhanced' ? ENHANCED_CONFIG_OVERRIDES : VANILLA_CONFIG_OVERRIDES);

export { applyProfilePreset };
