/* @layer renderer-components @kind logic */
/**
 * A preset pick, applied to the creation form: only the profile's own config.
 * The randomizer stays a separate choice on the form — a preset never
 * touches it.
 */
import type { GameSettings } from '@shared/types/settings';
import { ENHANCED_CONFIG_OVERRIDES, VANILLA_CONFIG_OVERRIDES } from './profile-presets.data';
import type { ProfilePresetId } from './profile-presets.type';

const applyProfilePreset = (id: ProfilePresetId): Partial<GameSettings> =>
  (id === 'enhanced' ? ENHANCED_CONFIG_OVERRIDES : VANILLA_CONFIG_OVERRIDES);

export { applyProfilePreset };
