/* @layer renderer-app @kind component */
import { useCallback } from 'react';
import type { PageProps, ScreenMeta } from '@drizztdourden08/brock-react';
import type { CreateProfileOptions } from '@app/profiles/types';
import { useDataLibrary } from '@app/views/DataManager/behavior/useDataLibrary';
import { ProfileManager } from '@app/views/DataManager/sub-components/ProfileManager';

const meta: ScreenMeta = { title: 'Profiles', icon: 'users', order: 1, fill: true, keywords: ['profile', 'create', 'delete', 'preset', 'language', 'msu', 'randomizer', 'archipelago'] };

const ProfilesPage = (props: PageProps) => {
  const { open } = props;
  const { profileMgmt, isGameRunning, refresh } = useDataLibrary();
  const { profiles, romDisplayInfos, loadingProfile, handleSelectProfile, handleCreateProfile, handleDeleteProfile } = profileMgmt;

  const selectProfile = useCallback((profile: Profile) => {
    void handleSelectProfile(profile).then(() => open('game'));
  }, [handleSelectProfile, open]);

  const createProfile = useCallback(async (opts: CreateProfileOptions) => {
    const result = await handleCreateProfile(opts);
    if (result.success) open('game');
    return result;
  }, [handleCreateProfile, open]);

  return (
    <ProfileManager
      profiles={profiles}
      romStatuses={romDisplayInfos}
      onSelectProfile={selectProfile}
      onCreateProfile={createProfile}
      onDeleteProfile={handleDeleteProfile}
      onRefresh={refresh}
      isGameRunning={isGameRunning}
      loadingProfile={loadingProfile}
    />
  );
};

export default ProfilesPage;
export { meta };
