/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ProfilePresetId } from '../profile-presets';

const STEP_IDS = {
  profile: 'profile',
  review: 'review',
} as const;

const stepLabels = (t: I18n['t']) => ({
  profile: t('wizards:profile.steps.profile'),
  review: t('wizards:profile.steps.review'),
}) as const;

const presetOptions = (t: I18n['t']): { value: ProfilePresetId; label: string }[] => [
  { value: 'vanilla', label: t('wizards:profile.preset.vanilla') },
  { value: 'enhanced', label: t('wizards:profile.preset.enhanced') },
];

export { presetOptions, STEP_IDS, stepLabels };
