/* @layer renderer-components @kind component */
import { EmptyState } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout } from '@drizztdourden08/tessera/composites';
import { useProfileManager } from './profile-manager/useProfileManager';
import { ProfileListPane } from './profile-manager/ProfileListPane';
import { ProfileCreateWizard } from './profile-manager/ProfileCreateWizard';
import { ProfileDetailPanel } from './profile-manager/profile-detail/ProfileDetailPanel';
import type { ProfileManagerProps } from './ProfileManager.type';

const ProfileManager = (props: ProfileManagerProps) => {
  const { profiles, romStatuses, onSelectProfile, onCreateProfile, onDeleteProfile, onRefresh, loadingProfile } = props;

  const manager = useProfileManager({ profiles, romStatuses, onRefresh });
  const { creating, languages, msuPacks, readyRoms, settings, selectedProfile, listCollapsed } = manager;

  const list = (
    <ProfileListPane
      manager={manager}
      profiles={profiles}
      loadingProfile={loadingProfile}
      onOpen={onSelectProfile}
      onDelete={onDeleteProfile}
    />
  );

  const detail = creating ? (
    <ProfileCreateWizard
      readyRoms={readyRoms}
      languages={languages}
      msuPacks={msuPacks}
      onCreateProfile={onCreateProfile}
      onCancel={manager.stopCreating}
      onCreated={manager.finishCreating}
    />
  ) : selectedProfile && (
    <ProfileDetailPanel
      key={selectedProfile.id}
      profile={selectedProfile}
      settings={settings}
      languages={languages}
      msuPacks={msuPacks}
      onSelectProfile={onSelectProfile}
      onDeleteProfile={onDeleteProfile}
      onRefresh={onRefresh}
    />
  );

  return (
    <ListDetailLayout
      listShowTitle={false}
      listContainers={[{ title: 'Profiles', content: list }]}
      listLabel="Profile manager"
      collapsed={listCollapsed}
      onCollapsedChange={manager.setListCollapsed}
      detailScroll={!creating}
      detail={detail}
      emptyDetail={<EmptyState message="Select a profile. Double-click to open it." />}
    />
  );
};

export { ProfileManager };
