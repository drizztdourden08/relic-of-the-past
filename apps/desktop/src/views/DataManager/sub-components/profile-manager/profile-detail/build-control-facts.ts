/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import type { ProfileData } from './profile-data.type';
import type { ProfileSettings } from './profile-detail.type';

const buildControlFacts = ({ inputProfiles }: ProfileData, settings: ProfileSettings, t: I18n['t']): FactsPanelFact[] => {
  const active = inputProfiles.find((input) => input.id === settings?.activeInputProfileId);
  return [
    { label: t('data-manager:profile-detail.controls.profiles'), value: String(inputProfiles.length) },
    { label: t('data-manager:profile-detail.controls.in-use'), value: active?.name ?? t('data-manager:profile-detail.controls.default') },
  ];
};

export { buildControlFacts };
