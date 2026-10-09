/* @layer renderer-components @kind logic */
import type { GameSettings } from '@rotp/features';
import { ENHANCED_CONFIG_OVERRIDES, VANILLA_CONFIG_OVERRIDES } from './profile-presets.data';
import type { ProfilePresetId } from './profile-presets.type';

const applyProfilePreset = (id: ProfilePresetId): Partial<GameSettings> =>
  (id === 'enhanced' ? ENHANCED_CONFIG_OVERRIDES : VANILLA_CONFIG_OVERRIDES);

export { applyProfilePreset };
