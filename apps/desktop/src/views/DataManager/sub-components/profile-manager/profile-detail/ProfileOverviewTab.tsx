/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Stack } from '@drizztdourden08/tessera/primitives';
import { buildProfileFacts } from './build-profile-facts';
import { FactsSection } from './FactsSection';
import { ProfileEditSection } from './ProfileEditSection';
import type { ProfileOverviewTabProps } from './profile-detail.type';

const ProfileOverviewTab = (props: ProfileOverviewTabProps) => {
  const t = useT();
  const { profile, mode, languages, msuPacks, onRefresh } = props;

  return (
    <Stack gap="lg">
      <ProfileEditSection profile={profile} languages={languages} msuPacks={msuPacks} onRefresh={onRefresh} />
      <FactsSection title={t('data-manager:profile-manager.profile-overview-tab.details')} facts={[buildProfileFacts(profile, mode, t)]} />
    </Stack>
  );
};

export { ProfileOverviewTab };
