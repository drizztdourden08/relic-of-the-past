/* @layer renderer-components @kind component */
import { Button, EmptyState, Spinner, Icon } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout, ListItemRow } from '@drizztdourden08/tessera/composites';
import { useProfileManager } from './profile-manager/useProfileManager';
import { ProfileCreateForm } from './profile-manager/ProfileCreateForm';
import { ProfileDetailPanel } from './profile-manager/ProfileDetailPanel';
import { ProfileRows } from './profile-manager/ProfileRows';
import { RandomizerOptionsPanel } from './profile-manager/RandomizerOptionsPanel';
import type { ProfileManagerProps } from './ProfileManager.type';

const ProfileManager = (props: ProfileManagerProps) => {
  const { profiles, romStatuses, onSelectProfile, onCreateProfile, onDeleteProfile, onRefresh, isGameRunning, loadingProfile } = props;

  const manager = useProfileManager({ profiles, romStatuses, onCreateProfile, onRefresh });
  const { selected, setSelected, creating, setCreating, form, languages, msuPacks, settings, readyRoms, selectedProfile } = manager;
  const { formRom, formRandomizer, setFormRandomizer, setFormError } = form;

  const list = (
    <>
      {loadingProfile && <ListItemRow selected icon={<Spinner size="sm" />} name={`Loading profile: ${loadingProfile}...`} />}
      {creating ? (
        <ProfileCreateForm
          form={form}
          readyRoms={readyRoms}
          languages={languages}
          msuPacks={msuPacks}
          onKeyDown={manager.handleKeyDown}
          onCancel={() => setCreating(false)}
          onCreate={() => void manager.handleCreate()}
        />
      ) : (
        readyRoms.length > 0 && (
          <Button variant="primary" fullWidth icon={<Icon name="plus" />} onClick={() => { setFormError(null); setCreating(true); }}>
            New Profile
          </Button>
        )
      )}
      <ProfileRows
        profiles={profiles}
        selected={selected}
        onSelect={setSelected}
        onOpen={onSelectProfile}
        onDelete={onDeleteProfile}
      />
    </>
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
      profile={selectedProfile}
      settings={settings}
      languages={languages}
      msuPacks={msuPacks}
      isGameRunning={isGameRunning}
      onSelectProfile={onSelectProfile}
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
