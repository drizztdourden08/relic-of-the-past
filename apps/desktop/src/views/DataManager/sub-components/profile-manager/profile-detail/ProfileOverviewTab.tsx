/* @layer renderer-components @kind component */
import { Stack } from '@drizztdourden08/tessera/primitives';
import { buildProfileFacts } from './build-profile-facts';
import { FactsSection } from './FactsSection';
import { ProfileEditSection } from './ProfileEditSection';
import type { ProfileOverviewTabProps } from './profile-detail.type';

const ProfileOverviewTab = (props: ProfileOverviewTabProps) => {
  const { profile, mode, languages, msuPacks, onRefresh } = props;

  return (
    <Stack gap="lg">
      <ProfileEditSection profile={profile} languages={languages} msuPacks={msuPacks} onRefresh={onRefresh} />
      <FactsSection title="Details" hint="Set by the app. These do not change here." facts={[buildProfileFacts(profile, mode)]} />
    </Stack>
  );
};

export { ProfileOverviewTab };
