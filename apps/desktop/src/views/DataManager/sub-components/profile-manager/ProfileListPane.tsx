/* @layer renderer-components @kind component */
import { Button, Icon, Spinner } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { ProfileCreateForm } from './ProfileCreateForm';
import { ProfileRows } from './ProfileRows';
import type { ProfileListPaneProps } from './profile-manager.type';

const ProfileListPane = (props: ProfileListPaneProps) => {
  const { manager, profiles, loadingProfile, onOpen, onDelete } = props;
  const { selected, setSelected, creating, setCreating, form, languages, msuPacks, readyRoms } = manager;

  return (
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
          <Button variant="primary" fullWidth icon={<Icon name="plus" />} onClick={() => { form.setFormError(null); setCreating(true); }}>
            New Profile
          </Button>
        )
      )}
      <ProfileRows profiles={profiles} selected={selected} onSelect={setSelected} onOpen={onOpen} onDelete={onDelete} />
    </>
  );
};

export { ProfileListPane };
