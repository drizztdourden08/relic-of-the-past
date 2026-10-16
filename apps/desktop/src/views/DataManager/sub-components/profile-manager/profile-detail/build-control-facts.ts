/* @layer renderer-components @kind logic */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import type { ProfileData } from './profile-data.type';
import type { ProfileSettings } from './profile-detail.type';

const buildControlFacts = ({ inputProfiles }: ProfileData, settings: ProfileSettings): FactsPanelFact[] => {
  const active = inputProfiles.find((input) => input.id === settings?.activeInputProfileId);
  return [
    { label: 'Controller profiles', value: String(inputProfiles.length) },
    { label: 'In use', value: active?.name ?? 'Default' },
  ];
};

export { buildControlFacts };
