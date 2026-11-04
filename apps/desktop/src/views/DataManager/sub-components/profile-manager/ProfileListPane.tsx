/* @layer renderer-components @kind component */
import { Button, Icon, Spinner } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { ProfileRows } from './ProfileRows';
import type { ProfileListPaneProps } from './profile-manager.type';

const ProfileListPane = (props: ProfileListPaneProps) => {
  const { manager, profiles, loadingProfile, onOpen, onDelete } = props;
  const { selected, select, creating, startCreating, readyRoms } = manager;

  return (
    <>
      {loadingProfile && <ListItemRow selected icon={<Spinner size="sm" />} name={`Loading profile: ${loadingProfile}...`} />}
      {readyRoms.length > 0 && (
        <Button variant="primary" fullWidth icon={<Icon name="plus" />} disabled={creating} onClick={startCreating}>
          New Profile
        </Button>
      )}
      <ProfileRows profiles={profiles} selected={creating ? null : selected} onSelect={select} onOpen={onOpen} onDelete={onDelete} />
    </>
  );
};

export { ProfileListPane };
