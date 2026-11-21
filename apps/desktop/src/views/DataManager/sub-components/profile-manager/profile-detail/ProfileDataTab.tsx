/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Spinner, Stack } from '@drizztdourden08/tessera/primitives';
import { useDateFormatOptions } from '@app/hooks/useDateFormatOptions';
import { buildControlFacts } from './build-control-facts';
import { buildPlayFacts } from './build-play-facts';
import { buildSaveFacts } from './build-save-facts';
import { FactsSection } from './FactsSection';
import { useProfileData } from './useProfileData';
import type { ProfileDataTabProps } from './profile-detail.type';

const ProfileDataTab = ({ profile, settings }: ProfileDataTabProps) => {
  const t = useT();
  const dates = useDateFormatOptions();
  const data = useProfileData(profile.id);

  if (data === null) return <Spinner size="md" />;
  return (
    <Stack gap="lg">
      <FactsSection title={t('data-manager:profile-manager.profile-data-tab.saves')} facts={[buildSaveFacts(data, t)]} />
      <FactsSection title={t('data-manager:profile-manager.profile-data-tab.play')} facts={[buildPlayFacts(data, t, dates)]} />
      <FactsSection title={t('data-manager:profile-manager.profile-data-tab.controls')} facts={[buildControlFacts(data, settings, t)]} />
    </Stack>
  );
};

export { ProfileDataTab };
