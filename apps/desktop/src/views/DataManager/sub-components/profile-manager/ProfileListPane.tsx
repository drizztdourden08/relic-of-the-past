/* @layer renderer-components @kind component */
import { Spinner } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { CreateListPane } from '@app/compounds/CreateListPane';
import { ProfileRows } from './ProfileRows';
import type { ProfileListPaneProps } from './profile-manager.type';

const ProfileListPane = (props: ProfileListPaneProps) => {
  const { manager, profiles, loadingProfile, onOpen, onDelete } = props;
  const { selected, select, creating, startCreating, readyRoms } = manager;

  const loadingRow = loadingProfile
    ? <ListItemRow selected icon={<Spinner size="sm" />} name={`Loading profile: ${loadingProfile}...`} />
    : null;

  return (
    <CreateListPane
      label="New Profile"
      creating={creating}
      available={readyRoms.length > 0}
      notice={loadingRow}
      onCreate={startCreating}
    >
      <ProfileRows profiles={profiles} selected={creating ? null : selected} onSelect={select} onOpen={onOpen} onDelete={onDelete} />
    </CreateListPane>
  );
};

export { ProfileListPane };
