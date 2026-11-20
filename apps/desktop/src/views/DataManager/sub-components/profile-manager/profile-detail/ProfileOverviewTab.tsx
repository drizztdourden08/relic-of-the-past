/* @layer renderer-components @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Stack } from '@drizztdourden08/tessera/primitives';
import { useDateFormatOptions } from '@app/hooks/useDateFormatOptions';
import { buildProfileFacts } from './build-profile-facts';
import { FactsSection } from './FactsSection';
import { ProfileEditSection } from './ProfileEditSection';
import type { ProfileOverviewTabProps } from './profile-detail.type';

const ProfileOverviewTab = (props: ProfileOverviewTabProps) => {
  const t = useT();
  const text = useText();
  const dates = useDateFormatOptions();
  const { profile, mode, languages, msuPacks, onRefresh } = props;

  return (
    <Stack gap="lg">
      <ProfileEditSection profile={profile} languages={languages} msuPacks={msuPacks} onRefresh={onRefresh} />
      <FactsSection title={t('data-manager:profile-manager.profile-overview-tab.details')} facts={[buildProfileFacts(profile, mode, t, text, dates)]} />
    </Stack>
  );
};

export { ProfileOverviewTab };
