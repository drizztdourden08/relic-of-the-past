/* @layer renderer-components @kind constants */
import type { ProfilePresetId } from '../profile-presets';

const STEP_IDS = {
  profile: 'profile',
  review: 'review',
} as const;

const STEP_LABELS = {
  profile: 'Profile',
  review: 'Review',
} as const;

const WIZARD_TITLE = 'New profile';

const FINISH_LABEL = 'Create profile';

const CREATING_HINT = 'Creating the profile';

const PRESET_OPTIONS: { value: ProfilePresetId; label: string }[] = [
  { value: 'vanilla', label: 'Vanilla' },
  { value: 'enhanced', label: 'Enhanced' },
];

const NO_NAME_ERROR = 'Give the profile a name.';

const NO_ROM_ERROR = 'Pick a ROM.';

const DEFAULT_LANGUAGE_LABEL = 'Default (English)';

const NO_MSU_LABEL = 'None';

export {
  CREATING_HINT, DEFAULT_LANGUAGE_LABEL, FINISH_LABEL, NO_MSU_LABEL, NO_NAME_ERROR, NO_ROM_ERROR, PRESET_OPTIONS,
  STEP_IDS, STEP_LABELS, WIZARD_TITLE,
};
