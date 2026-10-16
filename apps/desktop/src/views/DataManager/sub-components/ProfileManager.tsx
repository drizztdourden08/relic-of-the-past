/* @layer renderer-components @kind component */
import { EmptyState } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout } from '@drizztdourden08/tessera/composites';
import { useProfileManager } from './profile-manager/useProfileManager';
import { ProfileListPane } from './profile-manager/ProfileListPane';
import { ProfileDetailPanel } from './profile-manager/profile-detail/ProfileDetailPanel';
import { RandomizerOptionsPanel } from './profile-manager/RandomizerOptionsPanel';
import type { ProfileManagerProps } from './ProfileManager.type';

const ProfileManager = (props: ProfileManagerProps) => {
  const { profiles, romStatuses, onSelectProfile, onCreateProfile, onDeleteProfile, onRefresh, loadingProfile } = props;

  const manager = useProfileManager({ profiles, romStatuses, onCreateProfile, onRefresh });
  const { creating, form, languages, msuPacks, settings, selectedProfile } = manager;
  const { formRom, formRandomizer, setFormRandomizer } = form;

  const list = (
    <ProfileListPane
      manager={manager}
      profiles={profiles}
      loadingProfile={loadingProfile}
      onOpen={onSelectProfile}
      onDelete={onDeleteProfile}
    />
  );

  const detail = creating && formRandomizer.enabled ? (
    <RandomizerOptionsPanel
      romFile={formRom}
      seed={formRandomizer.seed}
      value={formRandomizer}
      onChange={(next) => setFormRandomizer({ ...formRandomizer, ...next })}
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
      list={list}
      detail={detail}
      emptyDetail={<EmptyState message="Select a profile to view details · Double-click to open" />}
    />
  );
};

export { ProfileManager };
